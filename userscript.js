// ==UserScript==
// @name         GeoFS Slew Mode
// @version      0.3
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
        slewForward: "i", //Increase slew forward speed/decrease slew backward speed
        slewLeft: "j", //Increase slew left speed/decrease slew right speed
        slewBackward: "k", //Increase slew backward speed/derease slew forward speed
        slewRight: "l", //Increase slew right speed/decrease slew left speed
        slewUp: "u", //Increase slew up speed/decrease slew down speed
        slewHR: ".", //Heading Right (turns your plane right 5 degrees)
        slewHL: ",", //Heading Left (turns your plane left 5 degrees)
        slewDown: "Enter" //Increase slew down speed/decrease slew up speed
    };

    var isSlewing = false;
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

    let lastFrameNumber = geofs.frameNumber;

    function checkFrameNumber() {
        if (!isSlewing) return;

        if (geofs.frameNumber !== lastFrameNumber) {
            lastFrameNumber = geofs.frameNumber;
            updateSlew();
        }
        requestAnimationFrame(checkFrameNumber);
    }

    document.addEventListener('keydown', function(event) {
            if (event.key == shortcuts.enableSlew) {
                isSlewing = !isSlewing;
                if (isSlewing) {
                    window.slew();
                } else {
                    geofs.camera.set(window.lastCam);
                    speedF = 0;
                    sideways = 0;
                    speedV = 0;
                    geofs.aircraft.instance.rigidBody.gravityForce = window.lastGravity;
                    window.slewDiv.innerHTML = ``;
                    if (!geofs.animation.values.groundContact) {
                        var c = geofs.aircraft.instance;
                        var m = c.definition.minimumSpeed / 1.94 * c.definition.mass;
                        c.rigidBody.applyCentralImpulse(V3.scale(c.object3d.getWorldFrame()[1], m));
                    }
                }
            } else if (event.key == shortcuts.slewForward) {
                speedF += 0.0001;
            } else if (event.key == shortcuts.slewBackward) {
                speedF -= 0.0001;
            } else if (event.key == shortcuts.slewRight) {
                sideways += 0.0001;
            } else if (event.key == shortcuts.slewLeft) {
                sideways -= 0.0001;
            } else if (event.key == shortcuts.slewUp) {
                speedV += 2;
            } else if (event.key == shortcuts.slewDown) {
                speedV -= 2;
            } else if (event.key == shortcuts.slewHR) {
                headingRad += (5*DEGREES_TO_RAD);
            } else if (event.key == shortcuts.slewHL) {
                headingRad -= (5*DEGREES_TO_RAD);
            }
        });

    async function updateSlew() {
        //console.log([slewA, slewB, slewAlt]);
        headingRad = headingRad % (360*DEGREES_TO_RAD);
        controls.setMode(window.pControl);
        var deltaX = (Math.cos(headingRad) * speedF) - (Math.sin(headingRad) * sideways);
        var deltaY = (Math.sin(headingRad) * speedF) + (Math.cos(headingRad) * sideways);
        slewA += deltaX;
        slewB += deltaY;
        slewAlt = (geofs.animation.values.groundContact && speedV < 0) ? slewAlt : slewAlt + speedV; //I'm pretty confident this will work (but it's giving me the most problems :\)
        geofs.aircraft.instance.llaLocation = [slewA, slewB, slewAlt];
        geofs.aircraft.instance.object3d.setInitialRotation([0,0,headingRad]);
        geofs.aircraft.instance.rigidBody.v_linearVelocity = [0,0,0];
        geofs.aircraft.instance.rigidBody.v_acceleration = [0,0,0];
        geofs.aircraft.instance.rigidBody.v_angularVelocity = [0,0,0];
        geofs.aircraft.instance.rigidBody.v_angularAcceleration = [0,0,0];
        geofs.aircraft.instance.rigidBody.gravityForce = [0,0,0];
        window.slewDiv.innerHTML = `
        <p style="margin: 0px; font-weight: bold;">LAT: ${slewA.toFixed(4)} LON: ${slewB.toFixed(4)} ALT: ${slewAlt.toFixed(1)} FT MSL MAG ${(headingRad*RAD_TO_DEGREES).toFixed(0)} ${((Math.abs(speedF) + Math.abs(sideways))/0.0001).toFixed(0)} UNITS</p>
        `;
    }

    window.slew = async function() {
        speedF = 0;
        sideways = 0;
        speedV = 0;
        window.lastGravity = geofs.aircraft.instance.rigidBody.gravityForce;
        window.lastCam = geofs.camera.currentMode;
        headingRad = geofs.animation.values.heading360 * DEGREES_TO_RAD;
        window.pControl = geofs.preferences.controlMode;
        slewA = geofs.aircraft.instance.llaLocation[0];
        slewB = geofs.aircraft.instance.llaLocation[1];
        slewAlt = geofs.aircraft.instance.llaLocation[2];
        geofs.camera.set(5);
        requestAnimationFrame(checkFrameNumber);
    };
})();
