package com.aemonbborn.gestaoea;

public final class ProgramUrlTest {
    public static void main(String[] args) {
        String valid = "https://script.google.com/macros/s/TEST_DEPLOYMENT_ID_123/exec";
        if (!valid.equals(ProgramUrl.normalize("  " + valid + "  "))) throw new AssertionError("Colar link com espaços");
        ProgramUrl.normalize(valid + "?authuser=0");
        ProgramUrl.normalize("https://script.google.com/macros/u/1/s/TEST_DEPLOYMENT_ID_123/exec");
        for (String invalid : new String[] {
                "", "http://script.google.com/macros/s/TEST_DEPLOYMENT_ID_123/exec",
                "https://docs.google.com/spreadsheets/d/TEST_ID/edit",
                "https://script.google.com.evil.example/macros/s/TEST_DEPLOYMENT_ID_123/exec",
                "https://script.google.com@evil.example/macros/s/TEST_DEPLOYMENT_ID_123/exec",
                "https://user@script.google.com/macros/s/TEST_DEPLOYMENT_ID_123/exec",
                "https://script.google.com:8080/macros/s/TEST_DEPLOYMENT_ID_123/exec",
                "https://script.google.com/macros/s/TEST_DEPLOYMENT_ID_123/dev",
                "javascript:alert(1)", "file:///sdcard/program.html", valid + "#other",
                "https://script.google.com/macros/s/TEST%2fDEPLOYMENT_ID_123/exec"
        }) {
            try { ProgramUrl.normalize(invalid); throw new AssertionError("URL indevida aceita: " + invalid); }
            catch (IllegalArgumentException expected) { /* Rejeição esperada. */ }
        }
        System.out.println("PASS: ligação HTTPS com Apps Script, colagem, conta Google e rejeição de links de planilha ou hosts/rotas indevidos.");
    }
}
