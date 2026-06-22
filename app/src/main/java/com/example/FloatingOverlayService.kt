package com.example

import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView

class FloatingOverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private var overlayView: View? = null
    private var params: WindowManager.LayoutParams? = null

    companion object {
        private const val PREFS_NAME = "DrClickerPrefs"
    }

    private val prefListener = SharedPreferences.OnSharedPreferenceChangeListener { _, key ->
        if (key == "enabled") {
            updateStatusUI()
        }
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        showOverlayPanel()
    }

    private fun showOverlayPanel() {
        val inflater = LayoutInflater.from(this)
        overlayView = inflater.inflate(R.layout.floating_layout, null)

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.CENTER_HORIZONTAL or Gravity.TOP
            x = 0
            y = 150
        }

        val localParams = params ?: return
        windowManager.addView(overlayView, localParams)

        setupDragBehaviour()
        setupListeners()
        updateStatusUI()

        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.registerOnSharedPreferenceChangeListener(prefListener)
    }

    private fun setupDragBehaviour() {
        val root = overlayView ?: return
        val header = root.findViewById<View>(R.id.drag_header) ?: return

        header.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f

            override fun onTouch(v: View?, event: MotionEvent?): Boolean {
                val ev = event ?: return false
                val lp = params ?: return false

                when (ev.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = lp.x
                        initialY = lp.y
                        initialTouchX = ev.rawX
                        initialTouchY = ev.rawY
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        lp.x = initialX + (ev.rawX - initialTouchX).toInt()
                        lp.y = initialY + (ev.rawY - initialTouchY).toInt()
                        windowManager.updateViewLayout(overlayView, lp)
                        return true
                    }
                }
                return false
            }
        })
    }

    private fun setupListeners() {
        val root = overlayView ?: return
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        val btnStart = root.findViewById<Button>(R.id.btn_start)
        val btnStop = root.findViewById<Button>(R.id.btn_stop)
        val btnHide = root.findViewById<Button>(R.id.btn_hide)

        btnStart?.setOnClickListener {
            prefs.edit().putBoolean("enabled", true).apply()
        }

        btnStop?.setOnClickListener {
            prefs.edit().putBoolean("enabled", false).apply()
        }

        btnHide?.setOnClickListener {
            prefs.edit().putBoolean("overlay_active", false).apply()
            stopSelf()
        }
    }

    private fun updateStatusUI() {
        val root = overlayView ?: return
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val isEnabled = prefs.getBoolean("enabled", false)

        val indicator = root.findViewById<View>(R.id.view_status_indicator)
        val statusText = root.findViewById<TextView>(R.id.tv_status_text)

        if (isEnabled) {
            indicator?.setBackgroundResource(R.drawable.dot_active)
            statusText?.text = "RUNNING"
            statusText?.setTextColor(android.graphics.Color.parseColor("#00E676"))
        } else {
            indicator?.setBackgroundResource(R.drawable.dot_inactive)
            statusText?.text = "STOPPED"
            statusText?.setTextColor(android.graphics.Color.parseColor("#B0BEC5"))
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.unregisterOnSharedPreferenceChangeListener(prefListener)
        overlayView?.let {
            windowManager.removeView(it)
        }
    }
}
