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
        val packageName = event.packageName?.toString() ?: ""
        if (packageName != "com.rapido.rider") {
            return
        }

        val prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
        val isEnabled = prefs.getBoolean("enabled", false)
        if (!isEnabled) {
            return
        }

        // Limit the frequency of scans to avoid high CPU usage
        if (isScanning) return
        isScanning = true

        mainHandler.postDelayed({
            try {
                parseFiltersAndMaybeAccept()
            } catch (e: Exception) {
                Log.e(TAG, "Error parsing fields: ${e.message}")
            } finally {
                isScanning = false
            }
        }, 100) // 100ms throttle
    }

    override fun onInterrupt() {
        Log.d(TAG, "Service onInterrupt")
    }

    private fun parseFiltersAndMaybeAccept() {
        val rootNode = rootInActiveWindow ?: return
        
        val nodeTexts = mutableListOf<String>()
        collectTexts(rootNode, nodeTexts)

        var extractedPrice: Int? = null
        var extractedPickup: Float? = null
        var extractedDrop: Float? = null

        for (text in nodeTexts) {
            val cleanText = text.lowercase().trim()

            // Parse Price numbers (e.g. ₹150, Rs. 150, 150 Rs)
            if (cleanText.contains("₹")) {
                val priceNum = extractNumber(cleanText, "₹")
                if (priceNum != null) extractedPrice = priceNum
            } else if (cleanText.contains("rs")) {
                val priceNum = extractNumber(cleanText, "rs")
                if (priceNum != null) extractedPrice = priceNum
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

        val isTarget = text.contains("accept") || desc.contains("accept") || 
                       text.contains("book") || desc.contains("book") ||
                       text.contains("confirm") || desc.contains("confirm")

        if (isTarget) {
            var current: AccessibilityNodeInfo? = node
            while (current != null) {
                if (current.isClickable) {
                    val targetNode = current
                    val delay = (10..100).random().toLong()
                    mainHandler.postDelayed({
                        targetNode.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                        Log.d(TAG, "Fast fallback text-click accept triggered on clickable node with class ${targetNode.className}")
                        triggerDoubleBeep()
                    }, delay)
                    return true
                }
                current = current.parent
            }
        }

        for (i in 0 until node.childCount) {
            if (clickAcceptNode(node.getChild(i))) return true
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

    // Heuristics for parsing amounts with rupee symbols
    private fun extractNumber(text: String, prefix: String): Int? {
        try {
            val index = text.indexOf(prefix)
            if (index == -1) return null
            val searchArea = text.substring(index + prefix.length)
            val sb = StringBuilder()
            var digitCaptured = false
            for (c in searchArea) {
                if (c.isDigit()) {
                    sb.append(c)
                    digitCaptured = true
                } else if (digitCaptured) {
                    break
                } else if (!c.isWhitespace()) {
                    break
                }
            }
            return if (sb.isNotEmpty()) sb.toString().toIntOrNull() else null
        } catch (e: Exception) {
            return null
        }
    }

    // Heuristics for parsing km floats (e.g., "pickup: 1.5 km", "drop 8.4 km")
    private fun extractDistanceInKm(text: String): Float? {
        try {
            val index = text.indexOf("km")
            if (index == -1) return null

            // Walk back from "km" to extract float substring
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
                return candidate.toFloatOrNull()
            }
        } catch (e: Exception) {
            // fallback
        }
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        executor.shutdown()
    }
}
