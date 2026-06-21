package com.example

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Path
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Display
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import org.opencv.android.OpenCVLoader
import org.opencv.android.Utils
import org.opencv.core.Core
import org.opencv.core.Mat
import org.opencv.imgproc.Imgproc
import java.io.File
import java.util.concurrent.Executors

class AutoAcceptEngineService : AccessibilityService() {

    private var isOpenCvInitialized = false
    private val executor = Executors.newSingleThreadExecutor()
    private val mainHandler = Handler(Looper.getMainLooper())
    private var isScanning = false
    private var pendingScanRunnable: Runnable? = null
    private var lastScanTime = 0L

    companion object {
        private const val TAG = "DrClickerService"
        private const val PREFS_NAME = "DrClickerPrefs"
    }

    override fun onCreate() {
        super.onCreate()
        try {
            isOpenCvInitialized = OpenCVLoader.initDebug()
            Log.d(TAG, "OpenCV initialized internally: $isOpenCvInitialized")
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing OpenCV: ${e.message}")
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        val eventPackageName = event.packageName?.toString() ?: ""
        val activePackageName = rootInActiveWindow?.packageName?.toString() ?: ""
        
        // Log all raw accessibility events for complete diagnostic visibility
        Log.v(TAG, "Raw accessibility event: type=${AccessibilityEvent.eventTypeToString(event.eventType)}, eventPkg=$eventPackageName, activePkg=$activePackageName")

        // Support any target package containing "rapido", "rider", "driver", or "partner" to handle regional or driver variants dynamically; also support our simulator package name
        val isTargetApp = eventPackageName.contains("rapido", ignoreCase = true) || 
                          activePackageName.contains("rapido", ignoreCase = true) ||
                          eventPackageName.contains("rider", ignoreCase = true) ||
                          activePackageName.contains("rider", ignoreCase = true) ||
                          eventPackageName.contains("driver", ignoreCase = true) ||
                          activePackageName.contains("driver", ignoreCase = true) ||
                          eventPackageName.contains("partner", ignoreCase = true) ||
                          activePackageName.contains("partner", ignoreCase = true) ||
                          eventPackageName.contains("example", ignoreCase = true) ||
                          activePackageName.contains("example", ignoreCase = true) ||
                          eventPackageName.contains("aistudio", ignoreCase = true) ||
                          activePackageName.contains("aistudio", ignoreCase = true) ||
                          eventPackageName.contains(packageName, ignoreCase = true) ||
                          activePackageName.contains(packageName, ignoreCase = true)

        if (!isTargetApp) {
            return
        }

        Log.d(TAG, "Target ride app event detected: type=${AccessibilityEvent.eventTypeToString(event.eventType)} pkg=$eventPackageName")
        
        val prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
        val isEnabled = prefs.getBoolean("enabled", false)
        if (!isEnabled) {
            return
        }

        val currentTime = System.currentTimeMillis()
        
        // Non-blocking time throttle to prevent task starvation/stagnation under high update frequencies (e.g., spinning radar or mapping updates)
        if (currentTime - lastScanTime < 120) {
            // Schedule a final backup scan in the near future to ensure the absolute last UI frame update is fully scanned
            pendingScanRunnable?.let { mainHandler.removeCallbacks(it) }
            val scanTask = Runnable {
                doScan(event.source)
            }
            pendingScanRunnable = scanTask
            mainHandler.postDelayed(scanTask, 120 - (currentTime - lastScanTime))
            return
        }

        // 120ms or more has passed: process immediately for maximum feedback speed
        pendingScanRunnable?.let { mainHandler.removeCallbacks(it) }
        doScan(event.source)
    }

    private fun doScan(source: AccessibilityNodeInfo?) {
        lastScanTime = System.currentTimeMillis()
        if (isScanning) return
        isScanning = true
        try {
            parseFiltersAndMaybeAccept(source)
        } catch (e: Exception) {
            Log.e(TAG, "Error in doScan routine: ${e.message}")
        } finally {
            isScanning = false
        }
    }

    override fun onInterrupt() {
        Log.d(TAG, "Service onInterrupt")
    }

    private fun parseFiltersAndMaybeAccept(eventSource: AccessibilityNodeInfo?) {
        val rootNode = rootInActiveWindow ?: eventSource ?: return
        
        val nodeTexts = mutableListOf<String>()
        collectTexts(rootNode, nodeTexts)

        Log.d(TAG, "Scanned page nodes count: ${nodeTexts.size}. Node texts: $nodeTexts")

        var extractedPrice: Int? = null
        var extractedPickup: Float? = null
        var extractedDrop: Float? = null

        for (text in nodeTexts) {
            val cleanText = text.lowercase().trim()

            // Parse Price numbers (e.g. ₹150, Rs. 150, 150 Rs, Fare: 150, Price 150)
            if (cleanText.contains("₹") || cleanText.contains("rs") || cleanText.contains("fare") || cleanText.contains("price") || cleanText.contains("amt") || cleanText.contains("amount")) {
                val priceNum = extractNumber(cleanText, "₹") 
                    ?: extractNumber(cleanText, "rs") 
                    ?: extractNumber(cleanText, "fare") 
                    ?: extractNumber(cleanText, "price") 
                    ?: extractNumber(cleanText, "amt")
                    ?: extractNumber(cleanText, "amount")
                    ?: extractDigitFallback(cleanText)
                if (priceNum != null) {
                    extractedPrice = priceNum
                }
            }

            // Parse distance (e.g. "Pickup: 1.2 km", "Drop: 8.5 km", "1.2 km away")
            if (cleanText.contains("km")) {
                val kmValue = extractDistanceInKm(cleanText)
                if (kmValue != null) {
                    if (cleanText.contains("pick") || cleanText.contains("away") || cleanText.contains("from")) {
                        extractedPickup = kmValue
                    } else if (cleanText.contains("drop") || cleanText.contains("to") || cleanText.contains("deliver")) {
                        extractedDrop = kmValue
                    } else {
                        // Heuristic fill
                        if (extractedPickup == null) {
                            extractedPickup = kmValue
                        } else if (extractedDrop == null) {
                            extractedDrop = kmValue
                        }
                    }
                }
            }
        }

        Log.d(TAG, "Scanned values -> Price: ₹$extractedPrice, Pickup: $extractedPickup km, Drop: $extractedDrop km")
        Log.d(TAG, "Criteria check started.")

        // Read preferences
        val prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
        val minPrice = prefs.getInt("min_price", 0)
        val maxPrice = prefs.getInt("max_price", 9999)
        val minPickup = prefs.getFloat("min_pickup", 0.0f)
        val maxDrop = prefs.getFloat("max_drop", 999.0f)

        // Validate filters
        var criteriaPassed = true

        if (extractedPrice != null) {
            if (extractedPrice < minPrice || extractedPrice > maxPrice) {
                Log.d(TAG, "Price $extractedPrice doesn't match range [$minPrice, $maxPrice]")
                criteriaPassed = false
            }
        }
        if (extractedPickup != null) {
            if (extractedPickup < minPickup) {
                Log.d(TAG, "Pickup $extractedPickup km under minimum config $minPickup")
                criteriaPassed = false
            }
        }
        if (extractedDrop != null) {
            if (extractedDrop > maxDrop) {
                Log.d(TAG, "Drop $extractedDrop km exceeds maximum config $maxDrop")
                criteriaPassed = false
            }
        }

        if (criteriaPassed) {
            Log.d(TAG, "Workflow match criteria satisfied! Procuring order accept click...")
            executeAcceptWorkflow()
        } else {
            Log.d(TAG, "Workflow match criteria NOT satisfied.")
        }
    }

    private fun executeAcceptWorkflow() {
        val prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
        val templateMatchEnabled = prefs.getBoolean("template_match_enabled", true)
        val templatePath = prefs.getString("template_path", null)

        if (templateMatchEnabled && !templatePath.isNullOrEmpty() && isOpenCvInitialized && Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Trigger high speed programmatic screenshot template matching
            triggerScreenshotTemplateMatching(templatePath)
        } else {
            // Text-based fallback accept click (extremely fast and doesn't require screenshots)
            clickAcceptNode(rootInActiveWindow)
        }
    }

    private fun triggerScreenshotTemplateMatching(templatePath: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            takeScreenshot(Display.DEFAULT_DISPLAY, executor, object : TakeScreenshotCallback {
                override fun onSuccess(screenshotResult: ScreenshotResult) {
                    val hardwareBuffer = screenshotResult.hardwareBuffer
                    val colorSpace = screenshotResult.colorSpace
                    val bitmap = Bitmap.wrapHardwareBuffer(hardwareBuffer, colorSpace)
                    val softwareBitmap = bitmap?.copy(Bitmap.Config.ARGB_8888, true)
                    
                    hardwareBuffer.close() // Close ASAP to prevent leak
                    
                    if (softwareBitmap != null) {
                        matchAndClick(softwareBitmap, templatePath)
                        softwareBitmap.recycle()
                    }
                }

                override fun onFailure(errorCode: Int) {
                    Log.e(TAG, "takeScreenshot failed: $errorCode")
                    // Immediate text accept backup click
                    clickAcceptNode(rootInActiveWindow)
                }
            })
        }
    }

    private fun matchAndClick(screenBitmap: Bitmap, templatePath: String) {
        try {
            val templateFile = File(templatePath)
            if (!templateFile.exists()) {
                Log.e(TAG, "Template image file missing from cache directory: $templatePath")
                return
            }
            val templateBitmap = BitmapFactory.decodeFile(templatePath) ?: return

            val screenMat = Mat()
            val templateMat = Mat()

            Utils.bitmapToMat(screenBitmap, screenMat)
            Utils.bitmapToMat(templateBitmap, templateMat)

            Imgproc.cvtColor(screenMat, screenMat, Imgproc.COLOR_BGRA2GRAY)
            Imgproc.cvtColor(templateMat, templateMat, Imgproc.COLOR_BGRA2GRAY)

            val resultMat = Mat()
            Imgproc.matchTemplate(screenMat, templateMat, resultMat, Imgproc.TM_CCOEFF_NORMED)

            val mmres = Core.minMaxLoc(resultMat)
            val maxVal = mmres.maxVal
            val matchLoc = mmres.maxLoc

            Log.d(TAG, "OpenCV template matching result score: $maxVal")

            if (maxVal >= 0.85) {
                val safeWidthMin = (templateMat.cols() * 0.25).toInt()
                val safeWidthMax = (templateMat.cols() * 0.75).toInt().coerceAtLeast(safeWidthMin + 1)
                val safeHeightMin = (templateMat.rows() * 0.25).toInt()
                val safeHeightMax = (templateMat.rows() * 0.75).toInt().coerceAtLeast(safeHeightMin + 1)

                val randomXOffset = kotlin.random.Random.nextInt(safeWidthMin, safeWidthMax)
                val randomYOffset = kotlin.random.Random.nextInt(safeHeightMin, safeHeightMax)
                val finalClickX = (matchLoc.x + randomXOffset).toFloat()
                val finalClickY = (matchLoc.y + randomYOffset).toFloat()

                Log.d(TAG, "Computer Vision Match Verified! Humanized click target: ($finalClickX, $finalClickY) with offsets ($randomXOffset, $randomYOffset)")
                
                injectTapGesture(finalClickX, finalClickY)
            } else {
                Log.d(TAG, "OpenCV score $maxVal below threshold. Falling back to native text click.")
                clickAcceptNode(rootInActiveWindow)
            }

            // Cleanup mats and bitmapps
            screenMat.release()
            templateMat.release()
            resultMat.release()
            templateBitmap.recycle()
        } catch (e: Exception) {
            Log.e(TAG, "Error in OpenCV processing engine: ${e.message}", e)
        }
    }

    private fun injectTapGesture(x: Float, y: Float) {
        val path = Path().apply { moveTo(x, y) }
        val stroke = GestureDescription.StrokeDescription(path, 0, 40)
        val gesture = GestureDescription.Builder().addStroke(stroke).build()

        // Randomized reflex delay restricted tightly and unpredictably between 10 milliseconds and 100 milliseconds
        val humanizedDelay = kotlin.random.Random.nextLong(10, 100)

        mainHandler.postDelayed({
            dispatchGesture(gesture, object : GestureResultCallback() {
                override fun onCompleted(gestureDescription: GestureDescription) {
                    super.onCompleted(gestureDescription)
                    Log.d(TAG, "Autoclick injection executed at coordinates ($x, $y) with a reflex delay of ${humanizedDelay}ms")
                    triggerDoubleBeep()
                }

                override fun onCancelled(gestureDescription: GestureDescription) {
                    super.onCancelled(gestureDescription)
                    Log.e(TAG, "Autoclick touch gesture cancelled")
                }
            }, mainHandler) // Separate high-priority UI thread callback
        }, humanizedDelay)
    }

    private fun clickAcceptNode(node: AccessibilityNodeInfo?): Boolean {
        if (node == null) return false

        val text = node.text?.toString()?.lowercase() ?: ""
        val desc = node.contentDescription?.toString()?.lowercase() ?: ""
        val viewId = node.viewIdResourceName?.lowercase() ?: ""

        val isTarget = text.contains("accept") || desc.contains("accept") || viewId.contains("accept") ||
                       text.contains("book") || desc.contains("book") || viewId.contains("book") ||
                       text.contains("confirm") || desc.contains("confirm") || viewId.contains("confirm") ||
                       text.contains("swipe") || desc.contains("swipe") || viewId.contains("swipe")

        if (isTarget) {
            Log.d(TAG, "Found target accept element! text='$text', desc='$desc', id='$viewId'")
            // Try 1: Find a clickable parent/ancestor
            var current: AccessibilityNodeInfo? = node
            while (current != null) {
                if (current.isClickable) {
                    val targetNode = current
                    val delay = (10..100).random().toLong()
                    mainHandler.postDelayed({
                        targetNode.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                        Log.d(TAG, "Fast fallback text/id ACTION_CLICK accept triggered on clickable node: $viewId")
                        triggerDoubleBeep()
                    }, delay)
                    return true
                }
                current = current.parent
            }

            // Try 2: Click using physical coordinates if no ancestor is marked isClickable
            val rect = android.graphics.Rect()
            node.getBoundsInScreen(rect)
            if (rect.width() > 0 && rect.height() > 0) {
                val x = rect.centerX().toFloat()
                val y = rect.centerY().toFloat()
                injectTapGesture(x, y)
                Log.d(TAG, "Fast fallback coordinate CLICK accept triggered on nodes bounds: ($x, $y)")
                return true
            }
        }

        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            if (child != null) {
                if (clickAcceptNode(child)) return true
            }
        }
        return false
    }

    private fun triggerDoubleBeep() {
        try {
            val toneGenerator = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 100)
            toneGenerator.startTone(ToneGenerator.TONE_PROP_BEEP, 80)
            
            // Wait 120ms then trigger the second beep for standard feedback double-chirp
            mainHandler.postDelayed({
                try {
                    toneGenerator.startTone(ToneGenerator.TONE_PROP_BEEP, 80)
                    // Release the tone generator resource safely
                    mainHandler.postDelayed({
                        toneGenerator.release()
                    }, 150)
                } catch (e: Exception) {
                    toneGenerator.release()
                }
            }, 120)
        } catch (e: Exception) {
            Log.e(TAG, "Audio tone generation failed: ${e.message}")
        }
    }

    private fun collectTexts(node: AccessibilityNodeInfo?, list: MutableList<String>) {
        if (node == null) return
        node.text?.let { list.add(it.toString()) }
        node.contentDescription?.let { list.add(it.toString()) }
        for (i in 0 until node.childCount) {
            collectTexts(node.getChild(i), list)
        }
    }

    // Heuristics for parsing amounts with prefix or suffix symbols
    private fun extractNumber(text: String, prefix: String): Int? {
        try {
            val index = text.indexOf(prefix)
            if (index == -1) return null

            // Try extracting digits after the prefix
            val afterPart = text.substring(index + prefix.length)
            val digitsAfter = StringBuilder()
            var digitCaptured = false
            for (c in afterPart) {
                if (c.isDigit()) {
                    digitsAfter.append(c)
                    digitCaptured = true
                } else if (digitCaptured) {
                    break
                } else if (!c.isWhitespace() && c != '.' && c != ':') {
                    break
                }
            }
            if (digitsAfter.isNotEmpty()) {
                val parsed = digitsAfter.toString().toIntOrNull()
                if (parsed != null) return parsed
            }

            // Try extracting digits before the prefix
            val beforePart = text.substring(0, index)
            val digitsBefore = StringBuilder()
            var digitCapturedBefore = false
            for (i in beforePart.length - 1 downTo 0) {
                val c = beforePart[i]
                if (c.isDigit()) {
                    digitsBefore.append(c)
                    digitCapturedBefore = true
                } else if (digitCapturedBefore) {
                    break
                } else if (!c.isWhitespace() && c != '.' && c != ':') {
                    break
                }
            }
            if (digitsBefore.isNotEmpty()) {
                return digitsBefore.reverse().toString().toIntOrNull()
            }
        } catch (e: Exception) {
            // ignore
        }
        return null
    }

    private fun extractDigitFallback(text: String): Int? {
        try {
            val digitsOnly = text.filter { it.isDigit() }
            if (digitsOnly.isNotEmpty()) {
                return digitsOnly.toIntOrNull()
            }
        } catch (e: Exception) {
            // ignore
        }
        return null
    }

    // Heuristics for parsing km floats (e.g., "pickup: 1.5 km", "drop 8.4 km")
    private fun extractDistanceInKm(text: String): Float? {
        try {
            val index = text.indexOf("km")
            if (index == -1) return null

            // Try walking back from "km" (digits before "km", e.g., "1.5 km", "1.5km")
            val sb = StringBuilder()
            var startCapturing = false
            for (i in (index - 1) downTo 0) {
                val c = text[i]
                if (c.isDigit() || c == '.') {
                    sb.append(c)
                    startCapturing = true
                } else if (startCapturing) {
                    if (c == ' ' || c == '\t') continue
                    break
                }
            }
            if (sb.isNotEmpty()) {
                val candidate = sb.reverse().toString().trim()
                val parsed = candidate.toFloatOrNull()
                if (parsed != null) return parsed
            }

            // Try searching after (e.g. "km: 1.5")
            val after = text.substring(index + 2)
            val sbAfter = StringBuilder()
            var startCapturingAfter = false
            for (c in after) {
                if (c.isDigit() || c == '.') {
                    sbAfter.append(c)
                    startCapturingAfter = true
                } else if (startCapturingAfter) {
                    break
                } else if (!c.isWhitespace() && c != ':' && c != '-') {
                    break
                }
            }
            if (sbAfter.isNotEmpty()) {
                return sbAfter.toString().toFloatOrNull()
            }
        } catch (e: Exception) {
            // ignore
        }
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        executor.shutdown()
    }
}
