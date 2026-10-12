package com.aemonbborn.gestaoea;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import java.util.List;

/** Chrome Custom Tabs conserva a autorização Google do navegador do usuário. */
public final class BrowserLauncher {
    private BrowserLauncher() {}

    public static void open(Activity activity, String url) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(ProgramUrl.normalize(url)));
        Bundle session = new Bundle();
        session.putBinder("android.support.customtabs.extra.SESSION", null);
        intent.putExtras(session);
        intent.putExtra("android.support.customtabs.extra.TOOLBAR_COLOR", Color.rgb(22, 103, 94));
        intent.putExtra("android.support.customtabs.extra.ENABLE_URLBAR_HIDING", true);
        intent.putExtra("android.support.customtabs.extra.TITLE_VISIBILITY", 1);
        String browser = customTabsPackage(activity.getPackageManager());
        if (browser != null) intent.setPackage(browser);
        activity.startActivity(intent);
    }

    private static String customTabsPackage(PackageManager manager) {
        List<ResolveInfo> services = manager.queryIntentServices(
                new Intent("android.support.customtabs.action.CustomTabsService"), 0);
        for (ResolveInfo info : services) {
            if ("com.android.chrome".equals(info.serviceInfo.packageName)) return info.serviceInfo.packageName;
        }
        ResolveInfo defaultBrowser = manager.resolveActivity(
                new Intent(Intent.ACTION_VIEW, Uri.parse("https://script.google.com")), PackageManager.MATCH_DEFAULT_ONLY);
        if (defaultBrowser != null) {
            for (ResolveInfo info : services) {
                if (info.serviceInfo.packageName.equals(defaultBrowser.activityInfo.packageName)) return info.serviceInfo.packageName;
            }
        }
        return null; // O Android abre o navegador padrão quando não há Custom Tabs.
    }
}
