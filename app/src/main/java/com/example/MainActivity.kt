package com.example

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import android.view.accessibility.AccessibilityManager
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.MyApplicationTheme
import java.io.File
import java.io.FileOutputStream

class MainActivity : ComponentActivity() {

    private val isOverlayGrantedState = mutableStateOf(false)

    private val overlayPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { _ ->
        val granted = Settings.canDrawOverlays(this)
        isOverlayGrantedState.value = granted
        if (granted) {
            Toast.makeText(this, "System Overlay Permission Granted!", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(this, "Overlay permission is required for floating control panel.", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        initializeDefaultTemplate()
        isOverlayGrantedState.value = Settings.canDrawOverlays(this)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                Scaffold(
                    modifier = Modifier.fillMaxSize()
                ) { innerPadding ->
                    DashboardScreen(
                        isOverlayGranted = isOverlayGrantedState.value,
                        onRequestOverlayPermission = {
                            val intent = Intent(
                                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                                Uri.parse("package:$packageName")
                            )
                            overlayPermissionLauncher.launch(intent)
                        },
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    )
                }
            }
        }
    }

    private fun initializeDefaultTemplate() {
        val prefs = getSharedPreferences("DrClickerPrefs", Context.MODE_PRIVATE)
        val currentPath = prefs.getString("template_path", "")
        if (currentPath.isNullOrEmpty() || !File(currentPath).exists()) {
            val outFile = File(filesDir, "accept_template.png")
            try {
                val width = 240
                val height = 60
                val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                val canvas = android.graphics.Canvas(bitmap)
                canvas.drawColor(android.graphics.Color.TRANSPARENT)

                val paint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG).apply {
                    color = android.graphics.Color.parseColor("#FEC107") // Gold Amber button Background
                    style = android.graphics.Paint.Style.FILL
                }

                val rect = android.graphics.RectF(0f, 0f, width.toFloat(), height.toFloat())
                val rx = height.toFloat() / 2f
                val ry = height.toFloat() / 2f
                canvas.drawRoundRect(rect, rx, ry, paint)

                val textPaint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG).apply {
                    color = android.graphics.Color.parseColor("#211400") // Dark contrast text matching image
                    textSize = 18f
                    isFakeBoldText = true
                    textAlign = android.graphics.Paint.Align.CENTER
                }

                val text = "Accept"
                val textHeight = textPaint.descent() - textPaint.ascent()
                val textOffset = textHeight / 3 - textPaint.descent()
                canvas.drawText(text, width / 2f, height / 2f + textOffset, textPaint)

                val outputStream = FileOutputStream(outFile)
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
                outputStream.flush()
                outputStream.close()
                bitmap.recycle()

                prefs.edit().putString("template_path", outFile.absolutePath).apply()
            } catch (e: Exception) {
                Log.e("MainActivity", "Error fallback template: ${e.message}")
            }
        }
    }

    override fun onResume() {
        super.onResume()
        isOverlayGrantedState.value = Settings.canDrawOverlays(this)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    isOverlayGranted: Boolean,
    onRequestOverlayPermission: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("DrClickerPrefs", Context.MODE_PRIVATE) }

    // Dashboard state variables, loaded initially from SharedPreferences
    var isEnabled by remember { mutableStateOf(prefs.getBoolean("enabled", false)) }
    var isOverlayActive by remember { mutableStateOf(prefs.getBoolean("overlay_active", false)) }
    var minPrice by remember { mutableStateOf(prefs.getInt("min_price", 0).let { if (it == 0) "" else it.toString() }) }
    var maxPrice by remember { mutableStateOf(prefs.getInt("max_price", 9999).let { if (it == 9999) "" else it.toString() }) }
    var minPickup by remember { mutableStateOf(prefs.getFloat("min_pickup", 0.0f).let { if (it == 0.0f) "" else it.toString() }) }
    var maxDrop by remember { mutableStateOf(prefs.getFloat("max_drop", 15.0f).let { if (it == 15.0f) "" else it.toString() }) }
    var cvMatchEnabled by remember { mutableStateOf(prefs.getBoolean("template_match_enabled", true)) }
    var templatePathState by remember { mutableStateOf(prefs.getString("template_path", "") ?: "") }

    androidx.compose.runtime.DisposableEffect(prefs) {
        val listener = android.content.SharedPreferences.OnSharedPreferenceChangeListener { sharedPreferences, key ->
            if (key == "enabled") {
                isEnabled = sharedPreferences.getBoolean("enabled", false)
            } else if (key == "overlay_active") {
                isOverlayActive = sharedPreferences.getBoolean("overlay_active", false)
            }
        }
        prefs.registerOnSharedPreferenceChangeListener(listener)
        onDispose {
            prefs.unregisterOnSharedPreferenceChangeListener(listener)
        }
    }

    // State for checking accessibility helper
    var isServiceActive by remember { mutableStateOf(false) }

    // Periodic check or onResume updates of Service status
    LaunchedEffect(Unit) {
        isServiceActive = checkAccessibilityServiceEnabled(context, AutoAcceptEngineService::class.java)
    }

    // Helper function to persist field values dynamically
    fun saveConfigs() {
        val editor = prefs.edit()
        editor.putBoolean("enabled", isEnabled)
        editor.putInt("min_price", minPrice.toIntOrNull() ?: 0)
        editor.putInt("max_price", maxPrice.toIntOrNull() ?: 9999)
        editor.putFloat("min_pickup", minPickup.toFloatOrNull() ?: 0.0f)
        editor.putFloat("max_drop", maxDrop.toFloatOrNull() ?: 15.0f)
        editor.putBoolean("template_match_enabled", cvMatchEnabled)
        editor.apply()
    }

    fun toggleEngine(targetValue: Boolean) {
        isEnabled = targetValue
        saveConfigs()
        if (targetValue && isOverlayGranted) {
            prefs.edit().putBoolean("overlay_active", true).apply()
            isOverlayActive = true
            val serviceIntent = Intent(context, FloatingOverlayService::class.java)
            try {
                context.startService(serviceIntent)
            } catch (e: Exception) {
                Log.e("MainActivity", "Error starting overlay: ${e.message}")
            }
        }
    }

    // Copy selected Uri from Gallery Picker to application cache directory
    val pickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            try {
                val inputStream = context.contentResolver.openInputStream(uri)
                val bitmap = BitmapFactory.decodeStream(inputStream)
                inputStream?.close()

                if (bitmap != null) {
                    val outFile = File(context.filesDir, "accept_template.png")
                    val outputStream = FileOutputStream(outFile)
                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
                    outputStream.flush()
                    outputStream.close()

                    templatePathState = outFile.absolutePath
                    prefs.edit().putString("template_path", outFile.absolutePath).apply()
                    bitmap.recycle()
                    Toast.makeText(context, "Asset Template Calibration Successful!", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(context, "Failed to decode template image format", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Log.e("MainActivity", "Error calibrating: ${e.message}")
                Toast.makeText(context, "Calibration error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // Deep Obsidian Luxury Accent styling
    val obsidianBackground = Color(0xFF0C0E14)
    val obsidianCardSurface = Color(0xFF161925)
    val neonGold = Color(0xFFFFD700) // Beautiful high contrast yellow gold
    val sleekBorderColor = Color(0xFF2C3044)

    Box(
        modifier = modifier
            .background(obsidianBackground)
            .fillMaxSize()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Header Section
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "DR. CLICKER",
                        color = Color.White,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.SansSerif,
                        letterSpacing = 2.sp
                    )
                    Text(
                        text = "ADMIN PRO WORKFLOWS",
                        color = neonGold,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        letterSpacing = 1.sp
                    )
                }

                // Active Badge
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(if (isEnabled && isServiceActive) Color(0xFF1B5E20) else Color(0xFF1A1C24))
                        .border(
                            1.dp,
                            if (isEnabled && isServiceActive) Color(0xFF4CAF50) else Color(0xFF37474F),
                            RoundedCornerShape(20.dp)
                        )
                        .padding(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .background(if (isEnabled && isServiceActive) Color(0xFF4CAF50) else Color.Gray)
                        )
                        Text(
                            text = if (isEnabled && isServiceActive) "ON-DUTY" else "STANDBY",
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            // Quick Info Notice Bar
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = obsidianCardSurface),
                border = BoxBorder(1.dp, sleekBorderColor)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = "Utility Information",
                        tint = neonGold,
                        modifier = Modifier.size(24.dp)
                    )
                    Text(
                        text = "Specially calibrated offline matching utility for Rapido Rider workflows. Zero network requests, 100% on-device efficiency.",
                        color = Color.LightGray,
                        fontSize = 13.sp,
                        lineHeight = 18.sp
                    )
                }
            }

            // Accessibility Permission Section
            AnimatedVisibility(
                visible = !isServiceActive,
                enter = fadeIn(tween(300)),
                exit = fadeOut(tween(300))
            ) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF2C1010)),
                    shape = RoundedCornerShape(16.dp),
                    border = BoxBorder(1.dp, Color(0xFFD32F2F))
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = "Alert",
                                tint = Color(0xFFFF5252)
                            )
                            Text(
                                text = "Accessibility Inactive",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                        }
                        Text(
                            text = "To deploy instantaneous coordinate tap injection, the Accessibility Service must be enabled in Settings.",
                            color = Color(0xFFFFCDD2),
                            fontSize = 13.sp,
                            lineHeight = 18.sp
                        )
                        Button(
                            onClick = {
                                try {
                                    val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                                    context.startActivity(intent)
                                } catch (e: Exception) {
                                    Toast.makeText(context, "Unable to launch settings", Toast.LENGTH_SHORT).show()
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD32F2F)),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(Icons.Default.Settings, contentDescription = "Grant")
                                Text("SYSTEM ACCESS ENABLER", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }

            // SYSTEM OVERLAY PERMISSION WARNING
            AnimatedVisibility(
                visible = !isOverlayGranted,
                enter = fadeIn(tween(300)),
                exit = fadeOut(tween(300))
            ) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF2C102C)),
                    shape = RoundedCornerShape(16.dp),
                    border = BoxBorder(1.dp, Color(0xFF9C27B0))
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = "Alert",
                                tint = Color(0xFFE040FB)
                            )
                            Text(
                                text = "System Draw Overlays Inactive",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                        }
                        Text(
                            text = "To draw the floating control panel directly over other maps and dispatch coordinate views, overlay permissions are required.",
                            color = Color(0xFFE1BEE7),
                            fontSize = 13.sp,
                            lineHeight = 18.sp
                        )
                        Button(
                            onClick = onRequestOverlayPermission,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF9C27B0)),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(Icons.Default.Settings, contentDescription = "Grant")
                                Text("GRANT SYSTEM OVERLAY ACCESS", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }

            // FLOATING PANEL CONTROLLER SWITCH
            if (isOverlayGranted) {

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            isOverlayActive = !isOverlayActive
                            prefs.edit().putBoolean("overlay_active", isOverlayActive).apply()
                            val serviceIntent = Intent(context, FloatingOverlayService::class.java)
                            if (isOverlayActive) {
                                try {
                                    context.startService(serviceIntent)
                                } catch (e: Exception) {
                                    Log.e("MainActivity", "Error starting overlay: ${e.message}")
                                }
                            } else {
                                context.stopService(serviceIntent)
                            }
                        },
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isOverlayActive) Color(0xFF1E1430) else obsidianCardSurface
                    ),
                    border = BoxBorder(
                        1.dp,
                        if (isOverlayActive) Color(0xFF9C27B0) else sleekBorderColor
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(20.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Info,
                                contentDescription = "Overlay icon",
                                tint = if (isOverlayActive) Color(0xFFE040FB) else Color.Gray,
                                modifier = Modifier.size(32.dp)
                            )
                            Column {
                                Text(
                                    text = "Floating Control Panel",
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp
                                )
                                Text(
                                    text = if (isOverlayActive) "Overlay widget is active on screen" else "Overlay widget is hidden",
                                    color = if (isOverlayActive) Color(0xFFE1BEE7) else Color.Gray,
                                    fontSize = 13.sp
                                )
                            }
                        }
                        Switch(
                            checked = isOverlayActive,
                            onCheckedChange = { value ->
                                isOverlayActive = value
                                prefs.edit().putBoolean("overlay_active", isOverlayActive).apply()
                                val serviceIntent = Intent(context, FloatingOverlayService::class.java)
                                if (isOverlayActive) {
                                    try {
                                        context.startService(serviceIntent)
                                    } catch (e: Exception) {
                                        Log.e("MainActivity", "Error starting overlay: ${e.message}")
                                    }
                                } else {
                                    context.stopService(serviceIntent)
                                }
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = Color(0xFF9C27B0),
                                uncheckedThumbColor = Color.Gray,
                                uncheckedTrackColor = Color(0xFF2C3044)
                            )
                        )
                    }
                }
            }

            // MAIN ON-DUTY SWITCH CARD
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable {
                        toggleEngine(!isEnabled)
                    },
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (isEnabled) Color(0xFF0F2615) else obsidianCardSurface
                ),
                border = BoxBorder(
                    1.dp,
                    if (isEnabled) Color(0xFF1B5E20) else sleekBorderColor
                )
            ) {
                Row(
                    modifier = Modifier.padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Status icon",
                            tint = if (isEnabled) Color(0xFF81C784) else Color.Gray,
                            modifier = Modifier.size(32.dp)
                        )
                        Column {
                            Text(
                                text = "Engine Activation",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                            Text(
                                text = if (isEnabled) "Ready to capture accept popup" else "Automator sleeping",
                                color = if (isEnabled) Color(0xFFA5D6A7) else Color.Gray,
                                fontSize = 13.sp
                            )
                        }
                    }
                    Switch(
                        checked = isEnabled,
                        onCheckedChange = {
                            toggleEngine(it)
                        },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = Color(0xFF4CAF50),
                            uncheckedThumbColor = Color.Gray,
                            uncheckedTrackColor = Color(0xFF2C3044)
                        )
                    )
                }
            }

            // SECTION 1: CRITERIA FILTER CARDS
            Text(
                text = "WORKFLOW MATCH FILTERS",
                color = Color.Gray,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.5.sp
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = obsidianCardSurface),
                border = BoxBorder(1.dp, sleekBorderColor)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Min & Max Price Fields Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        OutlinedTextField(
                            value = minPrice,
                            onValueChange = {
                                minPrice = it
                                saveConfigs()
                            },
                            label = { Text("Min Price (₹)", fontSize = 12.sp) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = neonGold,
                                unfocusedBorderColor = sleekBorderColor,
                                focusedLabelColor = neonGold,
                                unfocusedLabelColor = Color.Gray,
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White
                            ),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        )

                        OutlinedTextField(
                            value = maxPrice,
                            onValueChange = {
                                maxPrice = it
                                saveConfigs()
                            },
                            label = { Text("Max Price (₹)", fontSize = 12.sp) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = neonGold,
                                unfocusedBorderColor = sleekBorderColor,
                                focusedLabelColor = neonGold,
                                unfocusedLabelColor = Color.Gray,
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White
                            ),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        )
                    }

                    // Pickup & Drop Distances Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        OutlinedTextField(
                            value = minPickup,
                            onValueChange = {
                                minPickup = it
                                saveConfigs()
                            },
                            label = { Text("Min Pickup (km)", fontSize = 12.sp) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = neonGold,
                                unfocusedBorderColor = sleekBorderColor,
                                focusedLabelColor = neonGold,
                                unfocusedLabelColor = Color.Gray,
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White
                            ),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        )

                        OutlinedTextField(
                            value = maxDrop,
                            onValueChange = {
                                maxDrop = it
                                saveConfigs()
                            },
                            label = { Text("Max Drop (km)", fontSize = 12.sp) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = neonGold,
                                unfocusedBorderColor = sleekBorderColor,
                                focusedLabelColor = neonGold,
                                unfocusedLabelColor = Color.Gray,
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White
                            ),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            // SECTION 2: OPENCV CALIBRATION TEMPLATE REGISTRY
            Text(
                text = "OPENCV DYNAMIC MATCH PATTERNS",
                color = Color.Gray,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.5.sp
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = obsidianCardSurface),
                border = BoxBorder(1.dp, sleekBorderColor)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Computer Vision Matching",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                            Text(
                                text = "Perform pixel pattern cross-correlation",
                                color = Color.Gray,
                                fontSize = 12.sp
                            )
                        }
                        Switch(
                            checked = cvMatchEnabled,
                            onCheckedChange = {
                                cvMatchEnabled = it
                                saveConfigs()
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = neonGold,
                                uncheckedThumbColor = Color.Gray,
                                uncheckedTrackColor = Color(0xFF2C3044)
                            )
                        )
                    }

                    HorizontalDivider(color = sleekBorderColor, thickness = 1.dp)

                    // Image container preview
                    if (templatePathState.isNotEmpty() && File(templatePathState).exists()) {
                        val bitmap = remember(templatePathState) {
                            BitmapFactory.decodeFile(templatePathState)
                        }
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "ACTIVE 'ACCEPT' MATCH PATTERN",
                                color = neonGold,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(bottom = 8.dp)
                            )

                            if (bitmap != null) {
                                Image(
                                    bitmap = bitmap.asImageBitmap(),
                                    contentDescription = "Active Match Pattern Preview",
                                    modifier = Modifier
                                        .height(72.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .border(2.dp, neonGold, RoundedCornerShape(8.dp))
                                )
                            }

                            Row(
                                modifier = Modifier
                                    .padding(top = 12.dp)
                                    .fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                OutlinedButton(
                                    onClick = { pickerLauncher.launch("image/*") },
                                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                                    shape = RoundedCornerShape(10.dp),
                                    border = BoxBorder(1.dp, sleekBorderColor),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Icon(Icons.Default.Refresh, contentDescription = "Recalibrate")
                                        Text("RE-CALIBRATE", fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                    }
                                }

                                OutlinedButton(
                                    onClick = {
                                        templatePathState = ""
                                        prefs.edit().putString("template_path", "").apply()
                                        File(context.filesDir, "accept_template.png").delete()
                                        Toast.makeText(context, "Unlinked calibration. Text fallback activated.", Toast.LENGTH_SHORT).show()
                                    },
                                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFFF5252)),
                                    shape = RoundedCornerShape(10.dp),
                                    border = BoxBorder(1.dp, Color(0xFF4C2222)),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Icon(Icons.Default.Delete, contentDescription = "Clear")
                                        Text("UNLINK TEXTURE", fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                    }
                                }
                            }
                        }
                    } else {
                        // Empty calibration container state
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(120.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .border(1.dp, sleekBorderColor, RoundedCornerShape(12.dp))
                                .background(Color(0xFF0F111A))
                                .clickable { pickerLauncher.launch("image/*") },
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(6.dp),
                                modifier = Modifier.padding(16.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Add,
                                    contentDescription = "Calibrate Picker Icon",
                                    tint = Color.Gray,
                                    modifier = Modifier.size(32.dp)
                                )
                                Text(
                                    text = "SELECT PATTERN CALIBRATION IMAGE",
                                    color = neonGold,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "Crop and upload the yellow Rapido \"Accept\" button image snippet.",
                                    color = Color.Gray,
                                    fontSize = 11.sp,
                                    textAlign = TextAlign.Center,
                                    lineHeight = 15.sp
                                )
                            }
                        }
                    }

                    // How-To calibration notice
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color(0xFF10121C))
                            .padding(12.dp),
                        verticalAlignment = Alignment.Top,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = "Tip Info",
                            tint = Color.LightGray,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "Matching engine matches on-screen elements to this graphic template pixel-for-pixel using normalized grayscale cross-correlation.",
                            color = Color.LightGray,
                            fontSize = 11.sp,
                            lineHeight = 16.sp
                        )
                    }
                }
            }

            // Footer branding
            Text(
                text = "Dr. Clicker workflow automator runs strictly offline on your local device. Always prioritize road safety, maintain steering watch, and focus on passenger care.",
                color = Color.DarkGray,
                fontSize = 10.sp,
                textAlign = TextAlign.Center,
                lineHeight = 15.sp,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp)
            )
        }
    }
}

// Function to safely return custom card borders
private fun BoxBorder(width: androidx.compose.ui.unit.Dp, color: Color) = BorderStroke(width = width, color = color)

// Simple helper function to dynamically check if the designated Accessibility Service is enabled in settings
private fun checkAccessibilityServiceEnabled(context: Context, serviceClass: Class<out AccessibilityService>): Boolean {
    val accessibilityManager = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
    val enabledServices = accessibilityManager.getEnabledAccessibilityServiceList(android.accessibilityservice.AccessibilityServiceInfo.FEEDBACK_GENERIC)
    for (service in enabledServices) {
        if (service.id.contains(serviceClass.simpleName) || service.id.contains(context.packageName)) {
            return true
        }
    }
    return false
}
