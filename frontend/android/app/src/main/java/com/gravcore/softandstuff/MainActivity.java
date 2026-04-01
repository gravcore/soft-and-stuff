package com.gravcore.softandstuff;

// Navbar
import android.os.Bundle;
import android.os.Build;
import android.view.Window;
import android.view.WindowManager;
import android.graphics.Color;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    // Add to make the navbar transparent
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();

        // Transparent Navbar
        // For Android 5+ (Lollipop and above), allow changing navbar color
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
          // Make the navigation bar fully transparent
          window.setNavigationBarColor(Color.TRANSPARENT);
        }

        // For Android 11+ (API 30+), enable full edge-to-edge layout properly
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
          // Allows the app content to extend behind system bars
          window.setDecorFitsSystemWindows(false);
        }

        // Allow using the entire screen
        window.addFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
    }
}
