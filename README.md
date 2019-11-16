# JINS MEME Controller Library
====

## Overview

- Event detection of the first orientation and the number of consecutive times when the neck is swung right and left or up and down in short intervals
- Event detection of the first orientation and the number of consecutive times when the line of sight is moved right and left or up and down in short intervals
- Measurement of absolute value of neck angle (needs no calibration)

- 短い間隔で首を左右、または上下に振った時の最初の向きとその連続回数のイベント検出
- 短い間隔で視線を左右、または上下に動かした時の最初の向きとその連続回数のイベント検出
- 首の角度の絶対値の計測

## Description

You can use this library to forward a page, send an intent to  some other application, or issue a WebHook.
 Of course, the number of consecutive times == 1 frequently occurs in everyday life, use more than 2 as a trigger. 
The point is to move continuously at short intervals. This behavior is not usually done in everyday life,
 so it can be extracted with less misjudgment. 

ポイントは短い間隔で 連続して 動かす、というところです。この動作は日常生活で通常あまり行わないため誤判定を抑えて抽出できます。
これを利用して例えば文書のページを送ったり、何か他アプリにインテントを送ったり、WebHook発行したりすることができます。
当然ながら連続回数==1は日常生活で頻繁に発生するので2以上をトリガとしてご使用ください。

## Requirement

- cordova >= 6.5
- com.jins_jp.meme.plugin >= 1.2 (or monaca-plugin-jins-meme >= 1.3)

## Usage

- A client_id and secret in index.html are needed for JINS MEME SDK verification.
- Include following line.

- JINS MEME SDK の有効確認に必要な client_id と secret を[開発者サイト](https://jins-meme.com/ja/developers/) から取得しセットしてください。 
- 以下の行を追加してください。

> <script src="jmctrllib.js"></script>

### Swing and Eye move events

- Put methods that fire controll events.
- コントロールイベント発火メソッド

Put following lines in cordova.plugins.JinsMemePlugin.startDataReport() callback.
以下のメソッドを cordova.plugins.JinsMemePlugin.startDataReport() callback 内に記述してください。

```
 jmctrllib.getSequentialSwing(data); 
 jmctrllib.getSequentialEyeMove(data);
```

- Listen the controll events
- コントロールイベントのリスナ設定

Put following lines in somewhere.
適切な場所に以下のコードを記載してください。

```
// Lateral swings
document.addEventListener('jmctrllib_swing_lat', function(e) {
    // do something
    //console.log("lat directoin:" + e.detail.direction + " times:" + e.detail.count);
});
// Longitudinal swings
document.addEventListener('jmctrllib_swing_long', function(e) {
    // do something
    //console.log("lng directoin:" + e.detail.direction + " times:" + e.detail.count);
});
// Lateral eye movements
document.addEventListener('jmctrllib_eyemove_lat', function(e) {
    // do something
    //console.log("lat directoin:" + e.detail.direction + " times:" + e.detail.count);
});
// Lateral eye movements
document.addEventListener('jmctrllib_eyemove_long', function(e) {
    // do something
    //console.log("lng directoin:" + e.detail.direction + " times:" + e.detail.count);
});
```

These events have CustomEvent interface ('e').
これらのイベントはカスタムイベントインターフェース('e')を有します。

- e.detail.direction: Which direction did it occur at first time? (right/up == 1, left/down == -1) 
- e.detail.count: How many times did it occur?
- e.detail.direction: 最初にどちらに動かしたか？(右上 == 1, 左下 == -1)
- e.detail.count: 何回連続で動かしたか？

### Tilt calculation
- Put following lines in cordova.plugins.JinsMemePlugin.startDataReport() callback.
- 以下のメソッドを cordova.plugins.JinsMemePlugin.startDataReport() callback 内に記述してください。

 ```
 var tilt = jmctrllib.calcTilt(data);
 ```

## Licence

MIT

## Author

[jins-tkomoda](https://github.com/jins-tkomoda)
