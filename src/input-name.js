/**
 * Created by 赢潮 on 2015/2/19.
 */

var InputNameLayer = cc.Layer.extend({
    ctor:function (options) {
        this._super();

        var background = new cc.LayerColor(cc.color(0,0,0,0.5))
        this.addChild(background,-1)

        // Create the textfield
        var textField = new ccui.TextField();
        textField.setTouchEnabled(true);
        textField.fontName = "Marker Felt";
        textField.fontSize = 30;
        textField.placeHolder = "请输入您的名字";
        textField.setMaxLength(15);
        textField.x = cc.winSize.width / 2.0;
        textField.y = cc.winSize.height / 2.0;
        textField.addEventListener(this.textFieldEvent, this);
        this.addChild(textField);

        var store = localStorage.getItem("name");
        if ( store != null ){
            gameStatus.name = JSON.parse(store);
            textField.setString(name)
        } else {
            gameStatus.name = null
        }

        // Create the text button
        var textButton = new ccui.Button();
        textButton.setTouchEnabled(true);
        textButton.loadTextures("backtotopnormal.png", "backtotoppressed.png", "", ccui.Widget.PLIST_TEXTURE);
        textButton.setTitleText(OK_TEXT);
        textButton.setTitleColor(cc.color("black"))
        textButton.attr({
            x: size.width/2,
            y: 90,
            anchorX: 0.5,
            anchorY: 0.5
        })

        textButton.addTouchEventListener(function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    break;
                case ccui.Widget.TOUCH_MOVED:
                    break;
                case ccui.Widget.TOUCH_ENDED:
                    var name = textField.getText();
                    if ( name && name.trim() !== "" ) {
                        gameStatus.name = name;
                        cc.director.runScene(new MenuScene());
                    }
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    break;
                default:
                    break;
            }
        } ,this);
        this.addChild(textButton);
    },

    textFieldEvent: function (sender, type) {
        switch (type) {
            case ccui.TextField.EVENT_ATTACH_WITH_IME:
                break;
            case ccui.TextField.EVENT_DETACH_WITH_IME:
                break;
            case ccui.TextField.EVENT_INSERT_TEXT:
                break;
            case ccui.TextField.EVENT_DELETE_BACKWARD:
                break;
            default:
                break;
        }
    }

})

var InputNameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var scoreboard = new InputNameLayer()
        this.addChild(scoreboard)
    }
});