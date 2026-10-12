package com.aemonbborn.gestaoea.test;

import android.app.Activity;
import android.app.Instrumentation;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import com.aemonbborn.gestaoea.MainActivity;
import com.aemonbborn.gestaoea.R;
import java.util.ArrayList;
import java.util.List;

/** Testa a Activity instalada, bloqueando a navegação externa para não acessar contas reais. */
public final class SmokeInstrumentation extends Instrumentation {
    @Override public void onCreate(Bundle args) { super.onCreate(args); start(); }

    @Override public void onStart() {
        Bundle result = new Bundle();
        try {
            Context target = getTargetContext();
            target.getSharedPreferences("connection", Context.MODE_PRIVATE).edit().clear().commit();
            List<Intent> external = new ArrayList<>();
            addMonitor(new ActivityMonitor() {
                @Override public ActivityResult onStartActivity(Intent intent) {
                    if (Intent.ACTION_VIEW.equals(intent.getAction())) {
                        external.add(intent);
                        return new ActivityResult(Activity.RESULT_CANCELED, null);
                    }
                    return null;
                }
            });
            Intent launch = new Intent(target, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK).putExtra("configure", true);
            Activity activity = startActivitySync(launch);
            waitForIdleSync();
            runOnMainSync(() -> {
                check(activity.findViewById(R.id.connection_form).getVisibility() == View.VISIBLE, "Configuração na primeira abertura");
                EditText input = activity.findViewById(R.id.program_url);
                input.setText("https://docs.google.com/spreadsheets/d/TEST_ID/edit");
                activity.findViewById(R.id.open).performClick();
                check(input.getError() != null, "Link da planilha recusado com orientação");
                check(external.isEmpty(), "URL inválida não abre navegador");
                ClipboardManager clipboard = (ClipboardManager) target.getSystemService(Context.CLIPBOARD_SERVICE);
                clipboard.setPrimaryClip(ClipData.newPlainText("Teste", "https://script.google.com/macros/s/TEST_DEPLOYMENT_ID_123/exec"));
                activity.findViewById(R.id.paste).performClick();
                check(input.getText().toString().endsWith("/exec"), "Colar link do clipboard");
                activity.findViewById(R.id.open).performClick();
                check(external.size() == 1, "Navegação após salvar link válido");
                check(external.get(0).getDataString().equals(input.getText().toString()), "Navegação para a conexão escolhida");
                check(external.get(0).hasExtra("android.support.customtabs.extra.SESSION"), "Handoff para Custom Tabs");
                check(activity.findViewById(R.id.connection_form).getVisibility() == View.GONE, "Configuração recolhida depois de salvar");
                check(target.getSharedPreferences("connection", Context.MODE_PRIVATE).getString("program_url", "").endsWith("/exec"), "Conexão salva");
                activity.findViewById(R.id.edit_connection).performClick();
                check(activity.findViewById(R.id.connection_form).getVisibility() == View.VISIBLE, "Alterar conexão disponível");
                activity.finish();
            });
            Activity reopened = startActivitySync(new Intent(target, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            waitForIdleSync();
            check(external.size() == 2, "Abrir pelo ícone reutiliza conexão e abre automaticamente");
            runOnMainSync(reopened::finish);
            result.putString("gestao_smoke", "passed");
            result.putString("stream", "PASS: configuração nativa, colagem, validação, conexão salva e abertura automática para o navegador.\n");
            finish(Activity.RESULT_OK, result);
        } catch (Throwable error) {
            result.putString("gestao_smoke", "failed");
            result.putString("stream", error.toString());
            finish(Activity.RESULT_CANCELED, result);
        }
    }

    private static void check(boolean ok, String label) { if (!ok) throw new AssertionError(label); }
}
