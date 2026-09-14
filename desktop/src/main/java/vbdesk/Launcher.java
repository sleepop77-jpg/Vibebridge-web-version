package vbdesk;

/**
 * Thin entry point that does NOT extend javafx.application.Application.
 * JavaFX refuses to boot when the launched main class extends Application
 * and JavaFX sits on the classpath (jpackage app-images do exactly that).
 * Delegating from a plain class skips that check entirely.
 */
public class Launcher {
    public static void main(String[] args) {
        Main.main(args);
    }
}