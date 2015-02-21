/**
 * Created by 赢潮 on 2015/2/8.
 */
var DEFAULT_CARD_FLIP_TIME = 0.4

var CardSprite = cc.Sprite.extend({
    ctor: function( options ){
        var opt = options || {};
        this.imageMap = {
            front: opt.frontImage,
            back: opt.backImage
        }
        this.side = opt.side || "front";
        this.flipTime = opt.flipTime || DEFAULT_CARD_FLIP_TIME;

        this._super( this.imageMap[this.side] )

        this.flipActionFirstHalf = cc.scaleTo(this.flipTime/2, 0.01, 1)
        this.flipActionSecondHalf = cc.scaleTo(this.flipTime/2, 1, 1)
        var self = this;
        this.flipSequence = cc.sequence(this.flipActionFirstHalf, cc.callFunc(function( ) {
            if ( this.side != this.flipToSide ) {
                this.side = this.flipToSide
                this.setTexture(this.imageMap[this.side])
            }
        }, this), this.flipActionSecondHalf)
    },
    flip:function(){
        if ( this.side === "back" )
            this.flipToSide = "front";
        else this.flipToSide = "back";
        this.runAction(this.flipSequence);
    }
})

var DEFAULT_SORT_TIME = 0.3;
var SortableSpriteList = cc.Layer.extend({
    ctor: function( options ) {
        this._super();

        var opt = options || {};
        this.placeHolderSprite = opt.placeHolderSprite;
        this.sortTime = opt.sortTime || DEFAULT_SORT_TIME;
        this.x = opt.x || 0;
        this.y = opt.y || 0;
        this.restrict = opt.restrict || false;
        this.leaveable = opt.leaveable || false;
        this.width = opt.width || 0;//0: auto
        this.height = opt.height || 0;//0 : auto
        this.margin = opt.margin || 0;
        this.orientation = opt.orientation || "horizontal"
        this.needAnimation = opt.needAnimation || true;
        this.sprites = opt.sprites || [];
        _.each( this.sprites, function(s){
            this.addSprite(s,-1,false)
        },this)

        if ( this.placeHolderSprite ) {
            this.addChild(this.placeHolderSprite, 1)
            this.placeHolderSprite.setVisible(false);
        }
    },
    addSprite:function(sprite, index) {
        if (index === undefined)
            index = this.sprites.length;
        if (index < 0 || index > this.sprites.length)
            index = this.sprites.length;

        sprite.attr( {
                x:sprite.getAnchorPointInPoints().x,
                y:sprite.getAnchorPointInPoints().y
            })
        this.sprites.splice(index, 0, sprite)
        this.addChild(sprite, 1)

        this.__addListener(sprite)

        this.__rearrange();
    },
    __addListener:function(sprite){
        var self = this;
        cc.eventManager.addListener(cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: function (touch, event) {
                if ( this.__holding )
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
                var target = event.getCurrentTarget();
                var delta = touch.getDelta();
                target.x += delta.x;
                target.y += delta.y;
                if ( self.restrict ) {
                    target.y = Math.max( target.height/2, Math.min( this.height ? this.height : target.height/2, target.y ) )
                    target.x = Math.max( target.width/2, Math.min( ( this.width ? this.width : this.containWidth ) - target.width/2, target.x ) )
                }
                //remove target from list
                var index = _.indexOf(self.sprites, target);
                if ( index != -1 ) {
                    target.setLocalZOrder(100)
                    self.__holding = target;
                    self.sprites.splice(index, 1)
                }
                self.__renderPlaceHolder( target )
            },
            onTouchEnded: function (touch, event) {
                var target = event.getCurrentTarget();
                target.setLocalZOrder(1)

                var index = _.indexOf(self.sprites, target);
                if ( index == -1 ) {
                    self.sprites.splice(self.__insertIndex, 0, target)
                }
                self.__rearrange(true)
            }
        }), sprite);
    },
    __rearrange:function() {
        if ( this.sprites.length <= 0 )
            return;

        var x = 0;
        _.each(this.sprites, function(s){
            var archorPoint = s.getAnchorPointInPoints();
            var positionX = x + archorPoint.x;
            var positionY = archorPoint.y;
            this.__moveComponentTo(s, positionX, positionY)
            x += s.width + this.margin;
        },this)
        this.containWidth = x;
    },
    __renderPlaceHolder:function(sprite){
        var targetX = sprite.x - sprite.getAnchorPointInPoints().x;
        var index = -1;
        var indexX = 0;
        var found = false;
        for ( var i = 0; i < this.sprites.length; i++ ){
            var s = this.sprites[i];
            if ( indexX + s.getAnchorPointInPoints().x > targetX && !found ) {
                if ( this.placeHolderSprite ) {
                    this.placeHolderSprite.setVisible(true)
                    this.placeHolderSprite.x = indexX + this.placeHolderSprite.getAnchorPointInPoints().x
                    this.placeHolderSprite.y = this.placeHolderSprite.getAnchorPointInPoints().y
                }
                found = true;
                index = i;
                indexX += sprite.width + this.margin
            }

            this.__moveComponentTo( s, indexX + s.getAnchorPointInPoints().x, s.getAnchorPointInPoints().y )
            indexX += s.width + this.margin;
        }
        if ( !found ) {
            index = i;
            if ( this.placeHolderSprite ) {
                this.placeHolderSprite.setVisible(true)
                this.placeHolderSprite.x = indexX + this.placeHolderSprite.getAnchorPointInPoints().x
                this.placeHolderSprite.y = this.placeHolderSprite.getAnchorPointInPoints().y
            }
        }
        this.__insertIndex = index;
    },
    __moveComponentTo:function(sprite, x,y){
        if ( this.needAnimation ) {
            if ( sprite.__cardMove !== x ) {
                sprite.__cardMove = x;
                sprite.stopAllActions();
                var time = DEFAULT_SORT_TIME * Math.abs(sprite.x - x) / sprite.width
                sprite.runAction( cc.sequence(cc.moveTo(time, x, y), cc.callFunc(function( ) {
                    sprite.__cardMove = undefined;
                }, sprite) ) )
            }
        } else {
            sprite.attr({
                x: x,
                y: y
            })
        }
    },
    empty:function(){
        _.each( this.sprites, function(sprite){
            this.removeChild(sprite, true)
        },this)
        this.sprites = [];
    },
    removeSpriteByIndex:function(index){
        var sprite = this.sprites[index];
        if ( sprite )
            this.removeSprite(sprite)
    },
    removeSprite:function(sprite){

    }
})