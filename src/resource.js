var OK_TEXT = "确定"
var SUBMIT_BUTTON_TEXT = "确定顺序"
var CONTINUE_BUTTON_TEXT = "继续"
var SCORE_TITLE_TEXT = "得分："
var GRADE_TITLE_TEXT = "职称评定："
var TIME_TITLE_TEXT = "剩余时间："

var res = {
    intro_jpg : "res/intro.jpg",
    texture_plist : "res/texture.plist",
    texture_png : "res/texture.png",
    tp_png : "res/tp.png",
    game_bg_jpg : "res/game_bg.jpg",
    gameover_png : "res/gameover.png",
    correct_mp3 : "res/correct.mp3",
    wrong_mp3 : "res/wrong.mp3"
//    ,
//    card_place_holder_png : "res/card-place-holder.png",
//    card_front_png : "res/card-front.png",
//    card_back_png : "res/card-back.png"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}