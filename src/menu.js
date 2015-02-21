/**
 * Created by 赢潮 on 2015/2/19.
 */
var FIREBASE_URL = "https://apprentice-of-anubis.firebaseio.com"
//var FIREBASE_URL = "https://dungeon2048.firebaseio.com"

var TOP_SCORE_COUNT = 20
var SCORE_LINE_HEIGHT = 40
var SCORE_FONT_SIZE = 12

var ScoreBoardLayer = cc.Layer.extend({
    ctor:function (options) {
        this._super();

        this.scoreQuery = new Firebase(FIREBASE_URL+"/score").endAt().limit(TOP_SCORE_COUNT);
        this.scoreRef = this.scoreQuery.ref();
        var self = this;
        this.score = null;
        this.__initList();

        if ( gameStatus.score !== undefined ) {
            var score = {
                name : gameStatus.name,
                ".priority": gameStatus.score,
                score : gameStatus.score,
                timestamp: Firebase.ServerValue.TIMESTAMP,
                r: Math.random()
            }
            this.score = score;
            this.scoreRef.push(score, function(){
                cc.log("score upload complete");
                self.__fetchScore.call(self);
            })
        } else {
            this.__fetchScore.call(self);
        }

        // Create the text button
        var textButton = new ccui.Button();
        textButton.setTouchEnabled(true);
        textButton.loadTextures("backtotopnormal.png", "backtotoppressed.png", "", ccui.Widget.PLIST_TEXTURE);
        textButton.setTitleText("再玩一次");
        textButton.setTitleColor(cc.color(0,0,0,255))
        textButton.attr({
            x: cc.winSize.width/2,
            y: 20,
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
                    cc.director.runScene(new MainGameScene());
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    break;
                default:
                    break;
            }
        } ,this);
        this.addChild(textButton);
    },

    __fetchScore:function(){
        var self = this;
        this.scoreQuery.once("value",function(snapshot){
            self.scores = snapshot.val();
            self.__renderList.call(self);
        })
    },

    __initList: function(){
        var size = cc.winSize

        var coverBackground = new cc.Sprite(res.intro_jpg);
        //center
        coverBackground.attr({
            x: size.width / 2,
            y: size.height / 2
        });
        this.addChild(coverBackground, -2);

        var coverBackground =new cc.LayerColor(cc.color(255,255,255,128))
        //center
        coverBackground.attr({
            x: 0,
            y: 0,
            width: cc.winSize.width,
            height: cc.winSize.height,
            anchorX : 0.5,
            anchorY : 0.5
        });
        this.addChild(coverBackground, -1);

        // Create the scrollview
        this.scrollView = new ccui.ScrollView();
        this.scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.scrollView.setTouchEnabled(true);
        this.scrollView.setContentSize(cc.size(700,360));
        this.scrollView.x = 0;
        this.scrollView.y = 60;
        this.addChild(this.scrollView,2)

    },

    __renderList:function(){
        var i = 0;
        cc.log("renderlist")
        var length = _.size(this.scores)
        var innerWidth = this.scrollView.width;
        var innerHeight = (length+1)*SCORE_LINE_HEIGHT;
        this.scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));

        var foundMyself = false;

        _.each(this.scores,function(score){
            if ( score.name ) {
                var str = score.name + "          得分：" + score.score + "          " + moment(score.timestamp).locale("zh-cn").fromNow()
                var scoreLabel = new cc.LabelTTF(str, "Arial", SCORE_FONT_SIZE);
                // position the label on the center of the screen
                if (score.r == this.score.r) {
                    scoreLabel.setFontFillColor(cc.color(255, 0, 0, 255))
                    foundMyself = true
                } else
                    scoreLabel.setFontFillColor(cc.color(64, 64, 64, 255))

                scoreLabel.attr({
                    x: 50,
                    y: (2 + i) * (SCORE_LINE_HEIGHT) + 10,
                    anchorX: 0,
                    anchorY: 0
                })
                this.scrollView.addChild(scoreLabel)
                i++;
            }
        },this);

        if ( !foundMyself ) {
            var scoreLabel = new cc.LabelTTF("……", "Arial", SCORE_FONT_SIZE);
            scoreLabel.setFontFillColor(cc.color(64, 64, 64, 255))
            scoreLabel.attr({
                x: 50,
                y: 1 * (SCORE_LINE_HEIGHT) + 10,
                anchorX: 0,
                anchorY: 0
            })
            this.scrollView.addChild(scoreLabel)

            var str = this.score.name + "          得分：" + this.score.score + "          " + moment(this.score.timestamp).locale("zh-cn").fromNow()
            var scoreLabel = new cc.LabelTTF(str, "Arial", SCORE_FONT_SIZE);
            scoreLabel.setFontFillColor(cc.color(255, 0, 0, 255))
            scoreLabel.attr({
                x: 50,
                y: 0 * (SCORE_LINE_HEIGHT) + 10,
                anchorX: 0,
                anchorY: 0
            })
            this.scrollView.addChild(scoreLabel)
        }
    }

})

var MenuScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var scoreboard = new ScoreBoardLayer()
        this.addChild(scoreboard)
    }
});