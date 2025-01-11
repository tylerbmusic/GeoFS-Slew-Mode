// ==UserScript==
// @name         GeoFS Slew Mode
// @version      0.5
// @description  Slew mode from FSX
// @author       GGamerGGuy
// @match        https://www.geo-fs.com/geofs.php?v=*
// @match        https://*.geo-fs.com/geofs.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    if (!window.gmenu || !window.GMenu) {
        fetch('https://raw.githubusercontent.com/tylerbmusic/GeoFS-Addon-Menu/refs/heads/main/addonMenu.js')
            .then(response => response.text())
            .then(script => {eval(script);})
            .then(() => {setTimeout(afterGMenu, 100);});
    }
    function afterGMenu() {
        const slewMenu = new window.GMenu('Slew Mode', 'slew');
        slewMenu.addItem("Horizontal Speed (in degrees/frame): ", "LatSpeed", 'number', 0, '0.0001');
        slewMenu.addItem("Vertical Speed (in feet/frame): ", "VertSpeed", 'number', 0, '2');
        slewMenu.addItem("Rotate Amount (in degrees): ", "RotAmount", 'number', 0, '2');
        slewMenu.addItem("Speed after slew disabled (higher values are lower speeds, no flaps): ", "SpeedMultiplier", 'number', 0, '1.96');
        slewMenu.addItem("Speed after slew disabled (with flaps): ", "SpeedMultiplierFlaps", 'number', 0, '2.7');
        slewMenu.addHeader(2, "Keybinds");
        slewMenu.addKBShortcut("Toggle Slew Mode: ", "Toggle", 1, 'y', function(){kb("Toggle")});
        slewMenu.addKBShortcut("Forwards: ", "Forward", 1, 'i', function(){kb("Forward")});
        slewMenu.addKBShortcut("Backwards: ", "Backwards", 1, 'k', function(){kb("Backwards")});
        slewMenu.addKBShortcut("Left: ", "Left", 1, 'j', function(){kb("Left")});
        slewMenu.addKBShortcut("Right: ", "Right", 1, 'l', function(){kb("Right")});
        slewMenu.addKBShortcut("Up: ", "Up", 1, 'u', function(){kb("Up")});
        slewMenu.addKBShortcut("Down: ", "Down", 1, 'Enter', function(){kb("Down")});
        slewMenu.addHeader(3, "Rotation");
        slewMenu.addKBShortcut("Tilt Up: ", "RotTiltUp", 2, 'ArrowUp', function(){kb("TiltUp")});
        slewMenu.addKBShortcut("Tilt Down: ", "RotTiltDown", 2, 'ArrowDown', function(){kb("TiltDown")});
        slewMenu.addKBShortcut("Roll Left: ", "RotRLeft", 2, 'ArrowLeft', function(){kb("RLeft")});
        slewMenu.addKBShortcut("Roll Right: ", "RotRRight", 2, 'ArrowRight', function(){kb("RRight")});
        slewMenu.addKBShortcut("Yaw Left: ", "RotRYLeft", 2, ',', function(){kb("YLeft")});
        slewMenu.addKBShortcut("Yaw Right: ", "RotYRight", 2, '.', function(){kb("YRight")});
    }
    /*if (localStorage.getItem("slewEnabled") == null) { //Set defaults
        localStorage.setItem("slewEnabled", 'true');
        localStorage.setItem("slewLatSpeed", "0.0001");
        localStorage.setItem("slewVertSpeed", "2");
        localStorage.setItem("slewRotAmount", "2");
        localStorage.setItem("slewSpeedMultiplier", "1.96");
        localStorage.setItem("slewSpeedMultiplierFlaps", "2.7");
        localStorage.setItem("slewToggle", "y");
        localStorage.setItem("slewForward", "i");
        localStorage.setItem("slewBackwards", "k");
        localStorage.setItem("slewLeft", "j");
        localStorage.setItem("slewRight", "l");
        localStorage.setItem("slewUp", "u");
        localStorage.setItem("slewDown", "Enter");
        localStorage.setItem("slewRotTiltUp", "ArrowUp");
        localStorage.setItem("slewRotTiltDown", "ArrowDown");
        localStorage.setItem("slewRotRLeft", "ArrowLeft");
        localStorage.setItem("slewRotRRight", "ArrowRight");
        localStorage.setItem("slewRotYLeft", ",");
        localStorage.setItem("slewRotYRight", ".");
    }*/

    var isSlewing = false;
    var tilt = 0;
    var roll = 0;
    var speedF = 0; //forward/backward
    var sideways = 0; //left/right
    var speedV = 0; //up/down
    var slewA = 0;
    var slewB = 0;
    var slewAlt = 0;
    var headingRad = 0; //Used to make forward the aircraft's heading, not true north.
    window.lastCam = 0;
    window.lastGravity = [0,0,0];
    window.slewDiv = document.createElement('div');
    window.slewDiv.style.width = 'fit-content';
    window.slewDiv.style.height = 'fit-content';
    window.slewDiv.style.color = 'red';
    window.slewDiv.style.position = 'fixed';
    window.slewDiv.style.margin = '5px';
    document.body.appendChild(window.slewDiv);

    let lastFrameNumber = window.geofs.frameNumber;

    function checkFrameNumber() {
        if (!isSlewing) return;

        if (window.geofs.frameNumber !== lastFrameNumber) {
            lastFrameNumber = window.geofs.frameNumber;
            updateSlew();
        }
        requestAnimationFrame(checkFrameNumber);
    }

    function kb(event) { //kb = KeyBoard
        let shortcuts = {
            enableSlew: localStorage.getItem("slewToggle"),
            slewForward: localStorage.getItem("slewForward"), //Increase slew forward speed/decrease slew backward speed
            slewLeft: localStorage.getItem("slewLeft"), //Increase slew left speed/decrease slew right speed
            slewBackward: localStorage.getItem("slewBackwards"), //Increase slew backward speed/derease slew forward speed
            slewRight: localStorage.getItem("slewRight"), //Increase slew right speed/decrease slew left speed
            slewUp: localStorage.getItem("slewUp"), //Increase slew up speed/decrease slew down speed
            slewHR: localStorage.getItem("slewRotYRight"), //Heading Right (turns your plane right 2 degrees)
            slewHL: localStorage.getItem("slewRotYLeft"), //Heading Left (turns your plane left 2 degrees)
            rotation: {
                up: localStorage.getItem("slewRotTiltUp"), //Rotate up 2 degrees
                down: localStorage.getItem("slewRotTiltDown"), //Rotate down 2 degrees
                left: localStorage.getItem("slewRotRLeft"), //Rotate left 2 degrees
                right: localStorage.getItem("slewRotRRight") //Rotate right 2 degrees
            },
            slewDown: localStorage.getItem("slewDown") //Increase slew down speed/decrease slew up speed
        };
        const isChatFocused = (document.activeElement === document.getElementById("chatInput"));
        if (!isChatFocused && (localStorage.getItem("slewEnabled") == 'true')) {
            if (event == "Toggle") {
                isSlewing = !isSlewing;
                if (isSlewing) {
                    window.slew();
                } else {
                    window.geofs.camera.set(window.lastCam);
                    speedF = 0;
                    sideways = 0;
                    speedV = 0;
                    tilt = 0;
                    roll = 0;
                    window.geofs.aircraft.instance.rigidBody.gravityForce = window.lastGravity;
                    window.slewDiv.innerHTML = ``;
                    if (!window.geofs.animation.values.groundContact) {
                        var c = window.geofs.aircraft.instance;
                        var m;
                        if (window.geofs.animation.values.flapsTarget == 0) {
                            m = c.definition.minimumSpeed / Number(localStorage.getItem('slewSpeedMultiplier')) * c.definition.mass; // default 1.94
                        } else {
                            m = c.definition.minimumSpeed / Number(localStorage.getItem('slewSpeedMultiplierFlaps')) * c.definition.mass; // default 2.7
                        }
                        c.rigidBody.applyCentralImpulse(window.V3.scale(c.object3d.getWorldFrame()[1], m));
                    }
                }
            } else if (event == "Forward") {
                speedF += Number(localStorage.getItem('slewLatSpeed')); // 0.0001 by default
            } else if (event == "Backwards") {
                speedF -= Number(localStorage.getItem('slewLatSpeed'));
            } else if (event == "Right") {
                sideways += Number(localStorage.getItem('slewLatSpeed'));
            } else if (event == "Left") {
                sideways -= Number(localStorage.getItem('slewLatSpeed'));
            } else if (event == "Up") {
                speedV += Number(localStorage.getItem('slewVertSpeed'));
            } else if (event == "Down") {
                speedV -= Number(localStorage.getItem('slewVertSpeed'));
            } else if (event == "YRight") {
                headingRad += (Number(localStorage.getItem('slewRotAmount'))*window.DEGREES_TO_RAD);
            } else if (event == "YLeft") {
                headingRad -= (Number(localStorage.getItem('slewRotAmount'))*window.DEGREES_TO_RAD);
            } else if (event == "TiltUp") {
                tilt += (Number(localStorage.getItem('slewRotAmount'))*window.DEGREES_TO_RAD);
            } else if (event == "TiltDown") {
                tilt -= (Number(localStorage.getItem('slewRotAmount'))*window.DEGREES_TO_RAD);
            } else if (event == "RLeft") {
                roll += (Number(localStorage.getItem('slewRotAmount'))*window.DEGREES_TO_RAD);
            } else if (event == "RRight") {
                roll -= (Number(localStorage.getItem('slewRotAmount'))*window.DEGREES_TO_RAD);
            }
        }
    }

    async function updateSlew() {
        //console.log([slewA, slewB, slewAlt]);
        headingRad = headingRad % (360*window.DEGREES_TO_RAD);
        window.controls.setMode(window.pControl);
        var deltaX = (Math.cos(headingRad) * speedF) - (Math.sin(headingRad) * sideways);
        var deltaY = (Math.sin(headingRad) * speedF) + (Math.cos(headingRad) * sideways);
        slewA += deltaX;
        slewB += deltaY;
        slewAlt = (window.geofs.animation.values.groundContact && speedV < 0) ? slewAlt : slewAlt + speedV; //I'm pretty confident this will work (but it's giving me the most problems :\)
        window.geofs.aircraft.instance.llaLocation = [slewA, slewB, slewAlt];
        window.geofs.aircraft.instance.object3d.setInitialRotation([tilt,roll,headingRad]);
        window.geofs.aircraft.instance.rigidBody.v_linearVelocity = [0,0,0];
        window.geofs.aircraft.instance.rigidBody.v_acceleration = [0,0,0];
        window.geofs.aircraft.instance.rigidBody.v_angularVelocity = [0,0,0];
        window.geofs.aircraft.instance.rigidBody.v_angularAcceleration = [0,0,0];
        window.geofs.aircraft.instance.rigidBody.gravityForce = [0,0,0];
        window.slewDiv.innerHTML = `
        <p style="margin: 0px; font-weight: bold;">LAT: ${slewA.toFixed(4)} LON: ${slewB.toFixed(4)} ALT: ${(slewAlt*window.METERS_TO_FEET).toFixed(1)} FT MSL MAG ${(headingRad*window.RAD_TO_DEGREES).toFixed(0)} ${((Math.abs(speedF) + Math.abs(sideways))/Number(localStorage.getItem('slewLatSpeed'))).toFixed(0)} UNITS</p>
        `;
    }

    window.slew = async function() {
        speedF = 0;
        sideways = 0;
        speedV = 0;
        tilt = 0;
        roll = 0;
        window.lastGravity = window.geofs.aircraft.instance.rigidBody.gravityForce;
        window.lastCam = window.geofs.camera.currentMode;
        headingRad = window.geofs.animation.values.heading360 * window.DEGREES_TO_RAD;
        window.pControl = window.geofs.preferences.controlMode;
        slewA = window.geofs.aircraft.instance.llaLocation[0];
        slewB = window.geofs.aircraft.instance.llaLocation[1];
        slewAlt = window.geofs.aircraft.instance.llaLocation[2];
        window.geofs.camera.set(5);
        requestAnimationFrame(checkFrameNumber);
    };
})();
