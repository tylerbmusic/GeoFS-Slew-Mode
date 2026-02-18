// ==UserScript==
// @name         GeoFS Slew Mode
// @namespace    https://github.com/tylerbmusic/GeoFS-Slew-Mode
// @version      0.6.1
// @description  Slew mode from FSX
// @author       GGamerGGuy
// @match        https://www.geo-fs.com/geofs.php?v=*
// @match        https://*.geo-fs.com/geofs.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @grant        none
// @downloadURL  https://github.com/tylerbmusic/GeoFS-Slew-Mode/raw/refs/heads/main/userscript.js
// @updateURL    https://github.com/tylerbmusic/GeoFS-Slew-Mode/raw/refs/heads/main/userscript.js
// ==/UserScript==

(function() {
    'use strict';
    if (!window.gmenu || !window.GMenu) {
        fetch('https://raw.githubusercontent.com/tylerbmusic/GeoFS-Addon-Menu/refs/heads/main/addonMenu.js')
            .then(response => response.text())
            .then(script => {eval(script);})
            .then(() => {setTimeout(afterGMenu, 100);});
    } else afterGMenu()
    function afterGMenu() {
        const slewMenu = new window.GMenu('Slew Mode', 'slew');
        slewMenu.addItem("MSFS 2020 style", "Msfs", 'checkbox', 0, 'false');
        slewMenu.addNote("Hold keys to move instead of toggling them");
        slewMenu.addItem("Horizontal Speed (in degrees/frame): ", "LatSpeed", 'number', 0, '0.0001');
        slewMenu.addItem("Vertical Speed (in feet/frame): ", "VertSpeed", 'number', 0, '2');
        slewMenu.addItem("Rotate Amount (in degrees): ", "RotAmount", 'number', 0, '2');
        slewMenu.addItem("Speed after slew disabled (higher values are lower speeds, no flaps): ", "SpeedMultiplier", 'number', 0, '1.96');
        slewMenu.addItem("Speed after slew disabled (with flaps): ", "SpeedMultiplierFlaps", 'number', 0, '2.7');
        slewMenu.addHeader(2, "Keybinds");
        slewMenu.addKBShortcut("Toggle Slew Mode: ", "Toggle", 1, 'y', function(){kb("Toggle")});
        slewMenu.addKBShortcut("Forwards: ", "Forward", 1, 'i', function(){kb("Forward")}, function(){kbU("Forward")});
        slewMenu.addKBShortcut("Backwards: ", "Backwards", 1, 'k', function(){kb("Backwards")}, function(){kbU("Backwards")});
        slewMenu.addKBShortcut("Left: ", "Left", 1, 'j', function(){kb("Left")}, function(){kbU("Left")});
        slewMenu.addKBShortcut("Right: ", "Right", 1, 'l', function(){kb("Right")}, function(){kbU("Right")});
        slewMenu.addKBShortcut("Up: ", "Up", 1, 'u', function(){kb("Up")}, function(){kbU("Up")});
        slewMenu.addKBShortcut("Down: ", "Down", 1, 'Enter', function(){kb("Down")}, function(){kbU("Down")});
        slewMenu.addHeader(3, "Rotation");
        slewMenu.addKBShortcut("Tilt Up: ", "RotTiltUp", 2, 'ArrowUp', function(){kb("TiltUp")});
        slewMenu.addKBShortcut("Tilt Down: ", "RotTiltDown", 2, 'ArrowDown', function(){kb("TiltDown")});
        slewMenu.addKBShortcut("Roll Left: ", "RotRLeft", 2, 'ArrowLeft', function(){kb("RLeft")});
        slewMenu.addKBShortcut("Roll Right: ", "RotRRight", 2, 'ArrowRight', function(){kb("RRight")});
        slewMenu.addKBShortcut("Yaw Left: ", "RotRYLeft", 2, ',', function(){kb("YLeft")});
        slewMenu.addKBShortcut("Yaw Right: ", "RotYRight", 2, '.', function(){kb("YRight")});
        //Update notification
        async function checkForUpdates() {
            let NAME = "Slew-Mode";
            let SPACEDNAME = "Slew Mode";
            let LSNAME = "slew";
            let VERSION = "0.6.1";
            let URL = "https://github.com/tylerbmusic/GeoFS-Slew-Mode";
            let a = await fetch('https://tylerbmusic.github.io/versions.json?t=' + Date.now());
            let b = await a.text();
            let newversion = JSON.parse(b)[NAME];
            if (localStorage.getItem(LSNAME + "U" + VERSION) !== "true") { //Send an event upon updating (update data not available to the public)
                localStorage.setItem(LSNAME + "U" + VERSION, "true");
                await fetch(`https://track.tylerbialowas-bard.workers.dev?event=${LSNAME}v${VERSION}`, {method: "HEAD"});
            }
            if (newversion !== VERSION && localStorage.getItem(LSNAME + "StopU" + newversion) !== "true") {
                if (confirm(`A new update for ${SPACEDNAME} is available at ${URL}\nCurrent version: v${VERSION}; New version: v${newversion}\nPress "OK" open update URL in new tab, or "Cancel" to skip this update.`)) {
                    window.open(URL);
                    console.log("OPENING " + URL);
                } else {
                    localStorage.setItem(LSNAME + "StopU" + newversion, true);
                }
            }
        }
        checkForUpdates();

        //ANONYMOUS TRACKING VIA CLOUDFLARE (I will never sell your data.)
        //What's being tracked: For each script, how many hits (page loads) it's had in the last 24 hours, how many total hits in the last 30 days, and how many unique users there are.
        //Why it's being tracked: I am curious to know how many people are using my addons.
        //To see the data, go to https://tylerbmusic.github.io/stats in a web browser.

        async function track() {
            if (true) { //To opt out of anonymous tracking, change the word "true" in this line to "false".
                const SCRIPT_NAME = "Slew_Mode";

                // Generate persistent ID
                let userId = localStorage.getItem("myScriptUserId");

                if (!userId) {
                    userId = crypto.randomUUID();
                    localStorage.setItem("myScriptUserId", userId);
                }
                try {
                    const response = await fetch("https://track.tylerbialowas-bard.workers.dev", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            script: SCRIPT_NAME,
                            userId: userId
                        }),
                    });

                    if (response.ok) {
                        console.log("Analytics event sent successfully");
                    }
                } catch (error) {
                    console.error("Failed to track event:", error);
                }
            }
        }
        track();
    }
    function scale (e,t){return[e[0]*t,e[1]*t,e[2]*t]}
    window.DEGREES_TO_RAD = window.DEGREES_TO_RAD || 0.017453292519943295769236907684886127134428718885417254560971914401710091146034494436822415696345094822123044925073790592483854692275281012398474218934047117319168245015010769561697553581238605305168789;
    window.RAD_TO_DEGREES = window.RAD_TO_DEGREES || 57.295779513082320876798154814105170332405472466564321549160243861202847148321552632440968995851110944186223381632864893281448264601248315036068267863411942122526388097467267926307988702893110767938261;
    window.METERS_TO_FEET = window.METERS_TO_FEET || 3.280839895;
    window.slewEvents = {};
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
        const isChatFocused = (document.activeElement === document.getElementById("chatInput"));
        if (!isChatFocused && (localStorage.getItem("slewEnabled") == 'true')) {
            let blist = ["Forward", "Backwards", "Right", "Left", "Up", "Down"];
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
                        c.rigidBody.applyCentralImpulse(scale(c.object3d.getWorldFrame()[1], m));
                    }
                }
            } else if ((!window.slewEvents[event]) || blist.indexOf(event) == -1 || localStorage.getItem("slewMsfs") == 'false') {
                window.slewEvents[event] = true;
                if (event == "Forward" && localStorage.getItem("slewMsfs") == 'false') {
                    speedF += Number(localStorage.getItem('slewLatSpeed')); // 0.0001 by default
                } else if (event == "Backwards" && localStorage.getItem("slewMsfs") == 'false') {
                    speedF -= Number(localStorage.getItem('slewLatSpeed'));
                } else if (event == "Right" && localStorage.getItem("slewMsfs") == 'false') {
                    sideways += Number(localStorage.getItem('slewLatSpeed'));
                } else if (event == "Left" && localStorage.getItem("slewMsfs") == 'false') {
                    sideways -= Number(localStorage.getItem('slewLatSpeed'));
                } else if (event == "Up" && localStorage.getItem("slewMsfs") == 'false') {
                    speedV += Number(localStorage.getItem('slewVertSpeed'));
                } else if (event == "Down" && localStorage.getItem("slewMsfs") == 'false') {
                    speedV -= Number(localStorage.getItem('slewVertSpeed'));

                } else if (event == "Forward" && localStorage.getItem("slewMsfs") == 'true') {
                    speedF = [Number(localStorage.getItem('slewLatSpeed')), Date.now()-500];
                } else if (event == "Backwards" && localStorage.getItem("slewMsfs") == 'true') {
                    speedF = [-Number(localStorage.getItem('slewLatSpeed')), Date.now()-500];
                } else if (event == "Right" && localStorage.getItem("slewMsfs") == 'true') {
                    sideways = [Number(localStorage.getItem('slewLatSpeed')), Date.now()-500];
                } else if (event == "Left" && localStorage.getItem("slewMsfs") == 'true') {
                    sideways = [-Number(localStorage.getItem('slewLatSpeed')), Date.now()-500];
                } else if (event == "Up" && localStorage.getItem("slewMsfs") == 'true') {
                    speedV = [Number(localStorage.getItem('slewVertSpeed')), Date.now()-500];
                } else if (event == "Down" && localStorage.getItem("slewMsfs") == 'true') {
                    speedV = [-Number(localStorage.getItem('slewVertSpeed')), Date.now()-500];

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
    }
    function kbU(event) { //KeyBoardUp
        window.slewEvents[event] = false;
        if (localStorage.getItem("slewMsfs") == "true" && !(document.activeElement === document.getElementById("chatInput")) && localStorage.getItem("slewEnabled") == "true") {
            if (event == "Forward" || event == "Backwards") {
                speedF = 0;
            } else if (event == "Right" || event == "Left") {
                sideways = 0;
            } else if (event == "Up" || event == "Down") {
                speedV = 0;
            }
        }
    }

    async function updateSlew() {
        //console.log([slewA, slewB, slewAlt]);
        headingRad = headingRad % (360*window.DEGREES_TO_RAD);
        window.controls.setMode(window.pControl);
        let deltaX;
        let deltaY;
        if (localStorage.getItem("slewMsfs") == "true") {
            let altMult = Math.pow(Math.max(1,Math.log10(Math.abs(0.1*window.geofs.animation.values.haglFeet))), 2); //The further above the ground you are, the faster you go
            deltaX = (Math.cos(headingRad) * (speedF && altMult*speedF[0]*(Date.now()-speedF[1])/10000)) - (Math.sin(headingRad) * (sideways && altMult*sideways[0]*(Date.now()-sideways[1])/5000));
            deltaY = (Math.sin(headingRad) * (speedF && altMult*speedF[0]*(Date.now()-speedF[1])/10000)) + (Math.cos(headingRad) * (sideways && altMult*sideways[0]*(Date.now()-sideways[1])/5000));
            slewAlt = (window.geofs.animation.values.groundContact && (!speedV || speedV[0] <= 0)) ? slewAlt : slewAlt + (speedV && altMult*speedV[0]*(Date.now()-speedV[1])/5000);
        } else {
            deltaX = (Math.cos(headingRad) * speedF) - (Math.sin(headingRad) * sideways);
            deltaY = (Math.sin(headingRad) * speedF) + (Math.cos(headingRad) * sideways);
            slewAlt = (window.geofs.animation.values.groundContact && speedV <= 0) ? slewAlt : slewAlt + speedV; //I'm pretty confident this will work (but it's giving me the most problems :\)
        }
        slewA += deltaX;
        slewB += deltaY;
        window.geofs.aircraft.instance.llaLocation = [slewA, slewB, slewAlt];
        window.geofs.aircraft.instance.object3d.setInitialRotation([tilt,roll,headingRad]);
        window.geofs.aircraft.instance.rigidBody.v_acceleration = [0,0,0];
        window.geofs.aircraft.instance.rigidBody.v_angularAcceleration = [0,0,0];
        let ldgAGL = (window.geofs.animation.values.altitude !== undefined && window.geofs.animation.values.groundElevationFeet !== undefined) ? ((window.geofs.animation.values.altitude - window.geofs.animation.values.groundElevationFeet) + (window.geofs.aircraft.instance.collisionPoints[window.geofs.aircraft.instance.collisionPoints.length - 2].worldPosition[2]*3.2808399)) : 'N/A';
        if (!window.geofs.groundIsWater || ldgAGL > 3) { //If it's in the water, don't mess with some of the physics
            window.geofs.aircraft.instance.rigidBody.v_linearVelocity = [0,0,0];
            window.geofs.aircraft.instance.rigidBody.v_angularVelocity = [0,0,0];
            window.geofs.aircraft.instance.rigidBody.gravityForce = [0,0,0];
        }
        window.slewDiv.innerHTML = `
        <p style="margin: 0px; font-weight: bold;">LAT: ${slewA.toFixed(4)} LON: ${slewB.toFixed(4)} ALT: ${(slewAlt*window.METERS_TO_FEET).toFixed(1)} FT MSL MAG ${(headingRad*window.RAD_TO_DEGREES).toFixed(0)} ${((Math.abs((typeof speedF == "number") ? speedF : speedF[0]) + Math.abs((typeof sideways == "number") ? sideways : sideways[0]))/Number(localStorage.getItem('slewLatSpeed'))).toFixed(0)} UNITS</p>
        `;
    }

    window.slew = async function() {
        window.slewEvents = {};
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
