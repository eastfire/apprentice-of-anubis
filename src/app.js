var TAG_BOAT_SPRITE = 1;

var BOAT_WIDTH = 50
var RIVER_TOP = 500
var RIVER_BOTTOM = 100

var SOUL_LIST_ITEM_MARGIN = 10;
var SOUL_WIDTH = 80;

var SCORE_TITLE_TEXT_FONT_SIZE = 20;
var GRADE_TITLE_TEXT_FONT_SIZE = 20
var GRADE_VALUE_FONT_SIZE = 30
var TIME_OFFSET_X = 460
var TIME_OFFSET_Y = 465

var SOUL_LIST_X = 360;
var SOUL_LIST_Y = 80;

var BALANCE_X = 360
var BALANCE_Y = 350;

var GRADE_UPGRADE_THRESHOLD = 3
var DIFFICULTY_UPGRADE_THRESHOLD = 4

var GRADE_WORDING = [ "F", "E", "D", "C", "B", "A", "S", "SS", "SSS"]
var gameStatus = {}

var WEIGHT_SEQUENCE = [ "balloon","snow", "feather","pencil","eightball", "t-shirt","mug", "bowling","bike", "motorcycle","refrigerator","car", "elephant", "whale" ]
//var WEIGHT_SEQUENCE = [ "balloon", "t-shirt","mug", "refrigerator" ]
var WEIGHT_ORDER_MAP = {};
var DIFFICULTY_MAP = [
     {
        soulNumber : 3,
        imageTrickRate : 0,
        vipRate : 0
    },
    {
        soulNumber : 4,
        imageTrickRate : 0,
        vipRate : 0
    },
    {
        soulNumber : 5,
        imageTrickRate : 0.1,
        vipRate : 0
    },
    {
        soulNumber : 5,
        imageTrickRate : 0.2,
        vipRate : 0
    },
    {
        soulNumber : 6,
        imageTrickRate : 0.2,
        vipRate : 0
    },
    {
        soulNumber : 6,
        imageTrickRate : 0.4,
        vipRate : 0
    },
    {
        soulNumber : 7,
        imageTrickRate : 0.4,
        vipRate : 0
    }
]

var IMAGE_TRICK_MAP = {
    "balloon":{
        scale: 0.4,
        x: 40,
        y: 55
    },
    "t-shirt":{
        scale: 0.5,
        x: 40,
        y: 30
    },
    "mug":{
        scale: 0.6,
        x: 32,
        y: 30
    },
    "refrigerator":{
        scale: 0.4,
        x: 40,
        y: 30
    }
}

var LEFT_MEASURE_RECT = {
    height : 80,
    width : 80,
    x : 255,
    y : 300
}

var RIGHT_MEASURE_RECT = {
    height : 80,
    width : 80,
    x : 385,
    y : 300
}

var WEIGHT_SPRITE_TAG = 123


var SoulSprite = cc.Sprite.extend({
    ctor: function(options) {
        options = options || {}
        this.weight = options.weight;
        this.shape = options.shape;
        this._super(this.__getImage());
        var difficulty = DIFFICULTY_MAP[gameStatus.difficulty]
        if ( Math.random() > difficulty.vipRate ) {
            this.isVIP = true;
        } else {
            this.isVIP = false;
        }

        this.weightSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("weight-"+this.weight+".png"))

        if ( Math.random() < difficulty.imageTrickRate && _.contains(_.keys(IMAGE_TRICK_MAP), this.weight ) ) {
            do {
                this.imageTrick = _.sample(WEIGHT_SEQUENCE)
            } while ( this.imageTrick === this.weight  )
            this.__addImageTrick();
        } else {

        }
    },
    __getImage:function(){
        //return cc.spriteFrameCache.getSpriteFrame("weight-"+this.weight+".png")
        return cc.spriteFrameCache.getSpriteFrame("shape"+this.shape+".png")
    },
    __addImageTrick:function(){
        var trick = IMAGE_TRICK_MAP[ this.weight ]
        var trickSprite = new cc.Sprite( cc.spriteFrameCache.getSpriteFrame("weight-"+this.imageTrick+".png") )
        this.weightSprite.addChild(trickSprite,1);
        trickSprite.attr({
            x: trick.x,
            y: trick.y,
            anchorX : 0.5,
            anchorY : 0.5,
            scaleX : trick.scale,
            scaleY : trick.scale
        })
    },
    showWeight : function(){
        this.addChild(this.weightSprite,1)
        this.weightSprite.attr({
            x: 0,
            y: 110,
            anchorX : 0.5,
            anchorY : 0.5,
            anchorX: 0,
            anchorY : 0
        })
    },
    hideWeight: function() {

    }
})

var InteractLayer = cc.Layer.extend({
    ctor: function () {
        this._super();

        this.init();

        var size = cc.winSize;

        this.__addSubmitMenu();

        this.soulList = new SortableSpriteList({
            margin:SOUL_LIST_ITEM_MARGIN
        })
        this.soulList.attr({
            x: SOUL_LIST_X,
            y: SOUL_LIST_Y
        })
        this.addChild(this.soulList,2)
        this.generateSouls();

        var balanceSprite = new cc.Sprite(res.tp_png)
        balanceSprite.attr({
            x:BALANCE_X,
            y:BALANCE_Y
        })
        this.addChild(balanceSprite,1)

        var background = new cc.Sprite(res.game_bg_jpg);
        this.addChild(background, -1);
        background.attr({
            x:0,
            y:0,
            width:size.width,
            height:size.height,
            anchorX : 0,
            anchorY : 0
        })
    },
    
    generateSouls:function(){
        var difficulty = DIFFICULTY_MAP[gameStatus.difficulty];
        var totalWidth = difficulty.soulNumber * SOUL_WIDTH + (difficulty.soulNumber-1) * SOUL_LIST_ITEM_MARGIN
        var size = cc.winSize
        this.soulList.attr({
            width : totalWidth,
            x : (size.width - totalWidth )/ 2
        });
        this.soulList.empty();

        var weights = _.sample( WEIGHT_SEQUENCE, difficulty.soulNumber)
        var shapes = _.sample( [0,1,2,3,4,5,6,7], difficulty.soulNumber )
        for ( var i = 0; i < difficulty.soulNumber; i++){
            var soul = new SoulSprite({
                weight : weights[i],
                shape: shapes[i]
            })
            this.soulList.addSprite(soul,-1)
            var self = this;
            cc.eventManager.addListener(cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: false,
                onTouchBegan: function (touch, event) {
                    if ( gameStatus.phase === "wrong" )
                        return false;

                    var target = event.getCurrentTarget();

                    var locationInNode = target.convertToNodeSpace(touch.getLocation());
                    var s = target.getContentSize();
                    var rect = cc.rect(0, 0, s.width, s.height);

                    if (cc.rectContainsPoint(rect, locationInNode)) {
                        return true;
                    }
                    return false;
                },
                onTouchMoved: function (touch, event) {
                    if ( gameStatus.phase === "wrong" )
                        return;

                    var target = event.getCurrentTarget();
                    var point = target.convertToWorldSpace()
                    var targetRect = target.getBoundingBoxToWorld()
                    point = cc.p(targetRect.x + targetRect.width/2, targetRect.y + targetRect.height/2)
                    if (cc.rectContainsPoint(LEFT_MEASURE_RECT, point)) {
                        if ( !self.getChildByTag(WEIGHT_SPRITE_TAG) ) {
                            self.addChild(target.weightSprite, 3, WEIGHT_SPRITE_TAG);
                            target.weightSprite.attr({
                                x: RIGHT_MEASURE_RECT.x,
                                y: RIGHT_MEASURE_RECT.y,
                                anchorX: 0,
                                anchorY: 0
                            })
                        }
                    } else if (cc.rectContainsPoint(RIGHT_MEASURE_RECT, point)) {
                        if ( !self.getChildByTag(WEIGHT_SPRITE_TAG) ) {
                            self.addChild(target.weightSprite, 3, WEIGHT_SPRITE_TAG);
                            target.weightSprite.attr({
                                x: LEFT_MEASURE_RECT.x,
                                y: LEFT_MEASURE_RECT.y,
                                anchorX: 0,
                                anchorY: 0
                            })
                        }
                    } else {
                        if ( self.getChildByTag(WEIGHT_SPRITE_TAG) ) {
                            self.removeChild( target.weightSprite )
                        }
                    }
                },
                onTouchEnded: function (touch, event) {
                    if ( gameStatus.phase === "wrong" )
                        return;

                    var target = event.getCurrentTarget();
                    self.removeChild( target.weightSprite )
                }
            }), soul);
        }
    },
    newRound:function(){
        gameStatus.phase = "new-soul"
        gameStatus.turnCount ++
        this.adjustDifficulty();
        this.generateSouls()
    },
    adjustDifficulty:function(){
        if ( gameStatus.continueCorrect >= DIFFICULTY_UPGRADE_THRESHOLD ) {
            gameStatus.difficulty = Math.min( DIFFICULTY_MAP.length, gameStatus.difficulty+1)
        }
    },
    __onSubmit: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                break;
            case ccui.Widget.TOUCH_MOVED:
                break;
            case ccui.Widget.TOUCH_ENDED:
                //check
                var souls = this.soulList.sprites
                var correct = true;
                for ( var i = 0; i < souls.length - 1; i++){
                    if ( WEIGHT_ORDER_MAP[souls[i].weight] > WEIGHT_ORDER_MAP[souls[i+1].weight] ){
                        correct = false;
                        break;
                    }
                }
                if ( correct ) {
                    this.correct();
                } else {
                    this.wrong();
                }
                break;
            case ccui.Widget.TOUCH_CANCELED:
                break;
            default:
                break;
        }
    },
    __onContinue: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                break;
            case ccui.Widget.TOUCH_MOVED:
                break;
            case ccui.Widget.TOUCH_ENDED:
                if ( gameStatus.phase === "game-over") {
                    var layer = new InputNameLayer()
                    this.getParent().addChild(layer, 10)
                    interactLayer.removeFromParent(true)
                    uiLayer.removeFromParent(true)
                } else {
                    uiLayer.resumeCountDown()
                    this.continueMenu.setVisible(false)
                    this.submitMenu.setVisible(true)
                    this.newRound()
                }
                break;
            case ccui.Widget.TOUCH_CANCELED:
                break;
            default:
                break;
        }
    },
    __addSubmitMenu:function(){
        var size = cc.winSize;

        // Create the text button
        var textButton = new ccui.Button();
        textButton.setTouchEnabled(true);
        textButton.loadTextures("backtotopnormal.png", "backtotoppressed.png", "", ccui.Widget.PLIST_TEXTURE);
        textButton.setTitleText(SUBMIT_BUTTON_TEXT);
        textButton.setTitleColor(cc.color(0,0,0,255))
        textButton.attr({
            x : size.width / 2.0,
            y : 10,
            anchorX: 0.5,
            anchorY : 0
        })

        textButton.addTouchEventListener(this.__onSubmit ,this);
        this.addChild(textButton);
        this.submitMenu = textButton;

        var textButton = new ccui.Button();
        textButton.setTouchEnabled(true);
        textButton.loadTextures("backtotopnormal.png", "backtotoppressed.png", "", ccui.Widget.PLIST_TEXTURE);
        textButton.setTitleText(CONTINUE_BUTTON_TEXT);
        textButton.setTitleColor(cc.color(0,0,0,255))
        textButton.attr({
            x : size.width / 2.0,
            y : 10,
            anchorX: 0.5,
            anchorY : 0
        })

        textButton.addTouchEventListener(this.__onContinue ,this);
        this.addChild(textButton);
        this.continueMenu = textButton;
        this.continueMenu.setVisible(false)
    },
    correct:function(){
        gameStatus.timeLeft += 5
        uiLayer.renderTime()
        gameStatus.phase = "correct"
        var rate = 1
        if ( gameStatus.grade == 6 )
            rate = 2
        else if ( gameStatus.grade == 7 )
            rate = 3
        else if ( gameStatus.grade == 8 )
            rate = 4
        cc.audioEngine.playEffect(res.correct_mp3)

        gameStatus.score += this.soulList.sprites.length * rate * 10;
        uiLayer.renderScore()
        gameStatus.continueCorrect ++;
        if ( gameStatus.continueCorrect % GRADE_UPGRADE_THRESHOLD == 0 ) {
            gameStatus.grade = Math.min( GRADE_WORDING.length-1, gameStatus.grade+1 )
            uiLayer.renderGrade()
        }

        this.newRound()
    },
    wrong:function(){
        uiLayer.pauseCountDown()
        gameStatus.timeLeft += 3
        uiLayer.renderTime()
        gameStatus.phase = "wrong"
        cc.audioEngine.playEffect(res.wrong_mp3)
        gameStatus.continueCorrect = 0
        gameStatus.grade = Math.max( 0, gameStatus.grade-1 )
        uiLayer.renderGrade()

        _.each( this.soulList.sprites, function(sprite){
            sprite.showWeight()
        });
        //show soul weight
        this.continueMenu.setVisible(true)
        this.submitMenu.setVisible(false)

        if ( gameStatus.grade === 0 )
            uiLayer.gameOver()
    },

    gameOver:function(){
        this.submitMenu.setVisible(false)
        this.continueMenu.setVisible(true)
    }
});

var UILayer = cc.Layer.extend({
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        this.__addSettingMenu()
        this.__addScore();
        this.renderScore();
        this.renderGrade();
        this.__initCountDown()
        this.renderTime()
    },

    __addSettingMenu:function(){
        var size = cc.winSize;

        var menuItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("setting_default.png"),
            cc.spriteFrameCache.getSpriteFrame("setting_selected.png"),
            function () {

            }, this);
        menuItem.attr({
            x: size.width,
            y: size.height,
            anchorX: 1,
            anchorY: 1,
            scaleX: 0.5,
            scaleY: 0.5
        });
        var menu = new cc.Menu(menuItem);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu,1)
    },
    __addScore:function(){
        var size = cc.winSize;

        this.scoreTitle = new cc.LabelTTF(SCORE_TITLE_TEXT, "Arial", SCORE_TITLE_TEXT_FONT_SIZE);
        // position the label on the center of the screen
        this.scoreTitle.attr({
            color: cc.color(0,0,0,255),
            x: 15,
            y: 465,
            anchorX : 0,
            anchorY : 1
        })
        // add the label as a child to this layer
        this.addChild(this.scoreTitle, 1);

        this.gradeTitle = new cc.LabelTTF(GRADE_TITLE_TEXT, "Arial", GRADE_TITLE_TEXT_FONT_SIZE);
        // position the label on the center of the screen
        this.gradeTitle.attr({
            color: cc.color(0,0,0,255),
            x: 290,
            y: 465,
            anchorX : 0.5,
            anchorY : 1
        })
        // add the label as a child to this layer
        this.addChild(this.gradeTitle, 1);

        this.gradeValue = new cc.LabelTTF("", "Arial", GRADE_VALUE_FONT_SIZE);
        // position the label on the center of the screen
        this.gradeValue.attr({
            color: cc.color(0,0,0,255),
            x: 360,
            y: 470,
            anchorX : 0.5,
            anchorY : 1
        })
        // add the label as a child to this layer
        this.addChild(this.gradeValue, 1);

        this.timeTitle = new cc.LabelTTF("", "Arial", GRADE_TITLE_TEXT_FONT_SIZE);
        // position the label on the center of the screen
        this.timeTitle.attr({
            color: cc.color(0,0,0,255),
            x: TIME_OFFSET_X,
            y: TIME_OFFSET_Y,
            anchorX : 0.5,
            anchorY : 1
        })
        // add the label as a child to this layer
        this.addChild(this.timeTitle, 1);

        this.gameOverSprite = new cc.Sprite(res.gameover_png)
        this.gameOverSprite.attr({
            x: size.width/2,
            y: size.height*3/4,
            anchorX : 0.5,
            anchorY : 0.5
        })
        this.gameOverSprite.setVisible(false)
        this.addChild(this.gameOverSprite, 3)
    },
    renderScore: function(){
        this.scoreTitle.setString( SCORE_TITLE_TEXT + gameStatus.score )
    },
    renderGrade: function(){
        this.gradeValue.setString( GRADE_WORDING[gameStatus.grade] )
    },
    renderTime: function(){
        this.timeTitle.setString( TIME_TITLE_TEXT + gameStatus.timeLeft )
    },
    gameOver:function(){
        this.unschedule(this.__onTimerTick)
        this.gameOverSprite.setVisible(true)
        gameStatus.phase = "game-over"
        interactLayer.gameOver()
    },
    __onTimerTick:function(){
        if ( gameStatus.timeLeft > 0 ) {
            gameStatus.timeLeft--;
            uiLayer.renderTime()
        } else {
            uiLayer.gameOver()
        }
    },
    __initCountDown:function(){
        this.schedule(this.__onTimerTick,1, cc.REPEAT_FOREVER, 0)
    },
    pauseCountDown:function(){
        this.unschedule(this.__onTimerTick)
    },
    resumeCountDown:function(){
        this.schedule(this.__onTimerTick,1, cc.REPEAT_FOREVER, 0)
    }
})

var InputNameLayer = cc.Layer.extend({
    ctor:function (options) {
        this._super();

        var background = new cc.LayerColor(cc.color(255, 255, 255, 255))
        background.attr({
            x: 0,
            y: 0,
            width: cc.winSize.width,
            height: cc.winSize.height,
            anchorX : 0,
            anchorY : 0
        })
        this.addChild(background,-1)

        var scoreLabel = new cc.LabelTTF("", "Arial", SCORE_TITLE_TEXT_FONT_SIZE);
        // position the label on the center of the screen
        scoreLabel.attr({
            color: cc.color(0,0,0,255),
            x: 360,
            y: 465,
            anchorX : 0.5,
            anchorY : 1
        })
        scoreLabel.setString(SCORE_TITLE_TEXT+gameStatus.score)
        // add the label as a child to this layer
        this.addChild(scoreLabel, 1);

        // Create the textfield
        var textField = new ccui.TextField();
        textField.setTouchEnabled(true);
        textField.fontName = "Marker Felt";
        textField.fontSize = 30;
        textField.placeHolder = "请输入您的名字";
        textField.setMaxLength(15);
        textField.setTextColor(cc.color(0,0,0,255))
        textField.x = cc.winSize.width / 2.0;
        textField.y = 400;
        textField.addEventListener(this.textFieldEvent, this);
        this.addChild(textField);

        var store = localStorage.getItem("name");
        if ( store != null ){
            gameStatus.name = store;
            textField.setString(gameStatus.name)
        } else {
            gameStatus.name = null
        }

        // Create the text button
        var textButton = new ccui.Button();
        textButton.setTouchEnabled(true);
        textButton.loadTextures("backtotopnormal.png", "backtotoppressed.png", "", ccui.Widget.PLIST_TEXTURE);
        textButton.setTitleText(OK_TEXT);
        textButton.setTitleColor(cc.color(0,0,0,255))
        textButton.attr({
            x: cc.winSize.width/2,
            y: 290,
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
                    var name = textField.getString();
                    if ( name && name.trim() !== "" ) {
                        gameStatus.name = name.trim();
                        localStorage.setItem("name", gameStatus.name)
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

var MainGameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        this.__initGameStatus()
        this.__initWeight();
        this.__initTutorial()
        window.interactLayer = new InteractLayer();
        this.addChild(window.interactLayer,1);
        window.uiLayer = new UILayer();
        this.addChild(window.uiLayer,2);
    },
    __initGameStatus:function(){
        gameStatus = {
            turnCount: 1,
            score: 0,
            grade: 3, // SSS:8 SS:7 S:6 A:5 B:4 C:3 D:2 E:1 F:0
            continueCorrect: 0,
            difficulty: 0,
            timeLeft: 60,
            tutorial: true,
            phase: "new-soul" // new-soul , user-sort, correct, wrong, input-user-name, game-over
        }
    },
    __initTutorial:function(){
        var store = localStorage.getItem("tutorial");
        if ( store != null ){
            gameStatus.tutorial = store;
        }
    },
    setTutorial:function(on){
        localStorage.setItem("tutorial", on);
        gameStatus.tutorial = on;
    },
    __initWeight:function(){
        var i = 0;
        _.each( WEIGHT_SEQUENCE, function(weight){
            WEIGHT_ORDER_MAP[weight] = i;
            i++;
        } )

    }
});

