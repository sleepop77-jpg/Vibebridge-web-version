package vbdesk;

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.TextField;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.web.WebView;
import javafx.stage.Stage;

import java.util.prefs.Preferences;

public class Main extends Application {

    private static final String DEFAULT_URL = "https://sleepop77-jpg.github.io/Vibebridge-web-version/";
    private final Preferences prefs = Preferences.userRoot().node("vibebridge-desktop");

    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage stage) {
        String envUrl = System.getenv("VB_WEB_URL");
        String savedUrl = prefs.get("url", envUrl != null ? envUrl : DEFAULT_URL);

        TextField url = new TextField(savedUrl);
        url.setStyle(
            "-fx-background-color: #0A0A0A;" +
            "-fx-text-fill: #CCCCCC;" +
            "-fx-prompt-text-fill: #555555;" +
            "-fx-border-color: #2A2A2A;" +
            "-fx-border-radius: 8;" +
            "-fx-background-radius: 8;" +
            "-fx-font-family: 'JetBrains Mono', Consolas, monospace;" +
            "-fx-font-size: 12;" +
            "-fx-padding: 8;"
        );

        Button go = btn("GO", "#3BA55D", "#FFFFFF");
        Button reload = btn("⟳", "transparent", "#888888");
        reload.setStyle(reload.getStyle() + "-fx-border-color: #2A2A2A; -fx-border-radius: 8; -fx-background-radius: 8;");

        WebView web = new WebView();
        web.getEngine().setUserAgent("VibeBridge-Desktop/1.0");
        web.setStyle("-fx-background-color: #000000;");

        Runnable navigate = () -> {
            String u = url.getText().trim();
            if (!u.isEmpty()) {
                prefs.put("url", u);
                web.getEngine().load(u);
            }
        };

        go.setOnAction(e -> navigate.run());
        reload.setOnAction(e -> web.getEngine().reload());
        url.setOnKeyPressed(e -> { if (e.getCode() == KeyCode.ENTER) navigate.run(); });

        HBox.setHgrow(url, Priority.ALWAYS);
        HBox bar = new HBox(8, url, go, reload);
        bar.setAlignment(Pos.CENTER_LEFT);
        bar.setPadding(new Insets(10, 14, 10, 14));
        bar.setStyle("-fx-background-color: #0D0D0D;");

        BorderPane root = new BorderPane(web, bar, null, null, null);
        root.setStyle("-fx-background-color: #000000;");

        Scene scene = new Scene(root, 1080, 760);
        stage.setScene(scene);
        stage.setTitle("VibeBridge // Mission Control");
        stage.show();

        web.getEngine().load(savedUrl);
    }

    private static Button btn(String text, String bg, String fg) {
        Button b = new Button(text);
        b.setStyle(
            "-fx-background-color: " + bg + ";" +
            "-fx-text-fill: " + fg + ";" +
            "-fx-font-family: 'JetBrains Mono', Consolas, monospace;" +
            "-fx-font-weight: bold;" +
            "-fx-font-size: 11;" +
            "-fx-padding: 8 16;" +
            "-fx-background-radius: 8;" +
            "-fx-cursor: hand;"
        );
        return b;
    }
}