package vbdesk;

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.web.WebView;
import javafx.stage.Stage;

import java.util.prefs.Preferences;

public class Main extends Application {

    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage stage) {
        Preferences prefs = Preferences.userRoot().node("vibebridge");
        String def = System.getenv().getOrDefault("VB_WEB_URL",
            prefs.get("url", "https://YOUR-USERNAME.github.io/Vibebridge/"));

        TextField url = new TextField(def);
        url.getStyleClass().add("vb-url");
        Button go = new Button("GO");
        go.getStyleClass().add("vb-green-btn");
        Button reload = new Button("⟳");
        reload.getStyleClass().add("vb-ghost-btn");

        WebView web = new WebView();
        web.getEngine().setUserAgent("VibeBridgeDesk/1.0");

        go.setOnAction(e -> {
            String u = url.getText().trim();
            prefs.put("url", u);
            web.getEngine().load(u);
        });
        reload.setOnAction(e -> web.getEngine().reload());

        HBox.setHgrow(url, Priority.ALWAYS);
        HBox bar = new HBox(8, url, go, reload);
        bar.setAlignment(Pos.CENTER_LEFT);
        bar.setPadding(new Insets(8, 12, 8, 12));
        bar.setStyle("-fx-background-color: #0D0D0D;");

        BorderPane root = new BorderPane(web, bar, null, null, null);
        Scene scene = new Scene(root, 1024, 720);
        scene.getStylesheets().add(getClass().getResource("/style.css").toExternalForm());
        stage.setScene(scene);
        stage.setTitle("VibeBridge // Web Shell");
        stage.show();

        web.getEngine().load(def);
    }
}
