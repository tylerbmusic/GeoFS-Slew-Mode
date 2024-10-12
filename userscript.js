// ==UserScript==
// @name         GeoFS Slew Mode
// @version      0.1
// @description  Slew mode from FSX
// @author       GGamerGGuy
// @match        https://www.geo-fs.com/geofs.php?v=*
// @match        https://*.geo-fs.com/geofs.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var shortcuts = { //Change the values in quotes to change keybinds
        enableSlew: "y",
        slewForward: "i",
        slewLeft: "j",
        slewBackward: "k",
        slewRight: "l",
        slewUp: "u",
        slewDown: "Enter"
    };

    var isSlewing = false;
    var speedF = 0; //forward/backward
    var sideways = 0; //left/right
    var speedV = 0; //up/down
    var slewA = 0;
    var slewB = 0;
    var slewAlt = 0;
    var headingRad = 0; //Used to make forward the aircraft's heading, not true north.


    document.addEventListener('keydown', function(event) {
            if (event.key == shortcuts.enableSlew) {
                isSlewing = !isSlewing;
                if (isSlewing) {
                    window.slew();
                } else {
                    speedF = 0;
                    sideways = 0;
                    speedV = 0;
                    clearInterval(window.slewInterval);
                }
            } else if (event.key == shortcuts.slewForward) {
                speedF += 0.0005;
            } else if (event.key == shortcuts.slewBackward) {
                speedF -= 0.0005;
            } else if (event.key == shortcuts.slewRight) {
                sideways += 0.0005;
            } else if (event.key == shortcuts.slewLeft) {
                sideways -= 0.0005;
            } else if (event.key == shortcuts.slewUp) {
                speedV += 1;
            } else if (event.key == shortcuts.slewDown) {
                speedV -= 1;
            }
        });

    async function updateSlew() {
        //console.log([slewA, slewB, slewAlt]);
        headingRad = geofs.animation.values.heading360 * DEGREES_TO_RAD; //Used to make forward forward
        controls.setMode(window.pControl);
        slewA += (Math.cos(headingRad)*speedF) + (Math.sin(headingRad)*(0-sideways)); //These two should work, I think...
        slewB += (Math.sin(headingRad)*speedF) + (Math.cos(headingRad)*(0-sideways));
        slewAlt += speedV; //I'm pretty confident this will work (but it's giving me the most problems :\)
        geofs.aircraft.instance.llaLocation = [slewA, slewB, slewAlt];
    }

    window.slew = async function() {
        window.pControl = geofs.preferences.controlMode;
        slewA = geofs.aircraft.instance.llaLocation[0];
        slewB = geofs.aircraft.instance.llaLocation[1];
        slewAlt = geofs.aircraft.instance.llaLocation[2];
        window.slewInterval = setInterval(updateSlew, 10);
    };
})();
