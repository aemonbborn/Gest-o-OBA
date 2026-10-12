package com.aemonbborn.gestaoea;

import java.net.URI;
import java.net.URISyntaxException;

/** Aceita apenas uma implantação HTTPS do Apps Script, nunca o link da planilha. */
public final class ProgramUrl {
    private ProgramUrl() {}

    public static String normalize(String input) {
        String value = input == null ? "" : input.trim();
        try {
            URI uri = new URI(value);
            if (!"https".equalsIgnoreCase(uri.getScheme())
                    || !"script.google.com".equalsIgnoreCase(uri.getHost())
                    || uri.getRawUserInfo() != null
                    || (uri.getPort() != -1 && uri.getPort() != 443)
                    || uri.getFragment() != null
                    || uri.getRawPath() == null
                    || !uri.getRawPath().matches("/macros/(?:u/[0-9]+/)?s/[A-Za-z0-9_-]{10,}/exec")) {
                throw invalid();
            }
            return uri.toASCIIString();
        } catch (URISyntaxException e) {
            throw invalid();
        }
    }

    private static IllegalArgumentException invalid() {
        return new IllegalArgumentException("Cole a URL do aplicativo da Web do Apps Script, que termina em /exec. Você encontra em Implantar → Gerenciar implantações. O link da planilha não conecta o aplicativo.");
    }
}
