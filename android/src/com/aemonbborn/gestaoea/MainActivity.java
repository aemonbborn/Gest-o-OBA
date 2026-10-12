package com.aemonbborn.gestaoea;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Build;
import android.view.View;
import android.view.WindowInsets;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

public final class MainActivity extends Activity {
    private SharedPreferences preferences;
    private String connection = "";
    private View form;
    private EditText url;
    private TextView status;
    private Button open;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        setContentView(R.layout.activity_main);
        preferences = getSharedPreferences("connection", MODE_PRIVATE);
        connection = preferences.getString("program_url", getString(R.string.default_program_url));
        form = findViewById(R.id.connection_form);
        url = findViewById(R.id.program_url);
        status = findViewById(R.id.status);
        open = findViewById(R.id.open);
        View content = findViewById(R.id.content);
        content.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 35) {
                int space = Math.round(24 * getResources().getDisplayMetrics().density);
                view.setPadding(space, space + insets.getStableInsetTop(), space, space + insets.getStableInsetBottom());
            }
            return insets;
        });
        open.setOnClickListener(view -> openManagement());
        findViewById(R.id.paste).setOnClickListener(view -> pasteLink());
        findViewById(R.id.edit_connection).setOnClickListener(view -> showEditor(true));
        findViewById(R.id.help).setOnClickListener(view -> new AlertDialog.Builder(this)
                .setTitle(R.string.help).setMessage(R.string.help_text).setPositiveButton("Entendi", null).show());
        showEditor(connection.isEmpty() || getIntent().getBooleanExtra("configure", false));
        if (state == null && !connection.isEmpty() && !getIntent().getBooleanExtra("configure", false)) openManagement();
    }

    private void showEditor(boolean visible) {
        form.setVisibility(visible ? View.VISIBLE : View.GONE);
        findViewById(R.id.edit_connection).setVisibility(!visible && !connection.isEmpty() ? View.VISIBLE : View.GONE);
        open.setText(visible ? R.string.save_open : R.string.open);
        url.setText(connection);
        status.setVisibility(visible || connection.isEmpty() ? View.GONE : View.VISIBLE);
        status.setText(R.string.saved);
    }

    private void openManagement() {
        String candidate = form.getVisibility() == View.VISIBLE ? url.getText().toString() : connection;
        try {
            String normalized = ProgramUrl.normalize(candidate);
            preferences.edit().putString("program_url", normalized).apply();
            connection = normalized;
            url.setError(null);
            showEditor(false);
            BrowserLauncher.open(this, normalized);
        } catch (IllegalArgumentException e) {
            showEditor(true);
            url.setText(candidate);
            url.setError(e.getMessage());
            status.setText(e.getMessage());
            status.setVisibility(View.VISIBLE);
        } catch (ActivityNotFoundException e) {
            status.setText(R.string.missing_browser);
            status.setVisibility(View.VISIBLE);
        }
    }

    private void pasteLink() {
        ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
        ClipData data = clipboard.getPrimaryClip();
        if (data == null || data.getItemCount() == 0) {
            status.setText(R.string.clipboard_empty);
            status.setVisibility(View.VISIBLE);
            return;
        }
        url.setText(data.getItemAt(0).coerceToText(this));
        url.setError(null);
        status.setVisibility(View.GONE);
    }
}
