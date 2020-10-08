import * as alt from 'alt';
import * as game from 'natives';

alt.log('Client-side has loaded!');

const speedCamPlaceKey = 'B';
const speedCamUseKey = 'E';

camDict = {}

alt.onServer('Server:Log', (msg1, msg2) => {
    alt.log(`Message From Server: ${msg1}`);
    alt.log(`Message From Server: ${msg2}`);
});

alt.on('keydown', (key) => {
    if (alt.gameControlsEnabled()) {
      if (key === speedCamPlaceKey.charCodeAt(0)) {
        var playerPos = game.getEntityCoords(game.playerPedId());
        var player = alt.Player.local;
        var playerForwardVector = game.getEntityForwardVector(player.scriptID);
        var heading = game.getEntityHeading(player.scriptID) + 180;
        var result = {
          x: playerPos.x + playerForwardVector.x * 1,
          y: playerPos.y + playerForwardVector.y * 1,
          z: playerPos.z + playerForwardVector.z * 1
        }
        alt.emitServer("speedcam:spawn", result, player.pos, heading);
        alt.log("Client Server Spawn Cam");
      }
    }
  });

  alt.on('keydown', (key) => {
    if(key === speedCamUseKey.charCodeAt(0)){
      alt.emitServer("speedcam:use");
    }
  });

alt.onServer('speedcam:spawn', (speedcamID, pos, heading) => {
  spawnSpeedCam(speedcamID, pos, heading);
});

alt.onServer('speedcam:delete', (speedCamID) => {
  deleteSpeedCam(speedCamID);
});

alt.onServer('speedcam:showusehint', () => {
  showNotification("", null, "CHAR_SOCIAL_CLUB", 7, "Speedcam", 'Drücke E um den Blitzer zu benutzen', 0.5);
});

alt.onServer('speedcam:usecam', () => {
  alt.log("Starting use anim");
  startUseAnimation();
});

alt.onServer('speedcam:vehicleInDetectZone', (detectedEntityScriptID) => {
  var isPlayerCurrentlyUsingCam = false; // TODO
  if(isPlayerCurrentlyUsingCam){
    var detectedvehicle = alt.Vehicle.getByScriptID(detectedEntityScriptID);
    showNotification("", null, "CHAR_SOCIAL_CLUB", 7, "Speedcam", 'Fahrzeug erkannt', 0.5);
    // TODO Infos zu vehicle anzeigen
  }else{
    alt.emitServer('speedcam:notusinganymore');
  }
});


function spawnSpeedCam(speedcamID, pos, heading){
  alt.log("Client Client Spawn Cam");
  const entityID = game.createObjectNoOffset(1355733718,pos.x,pos.y,pos.z);
  camDict[speedcamID] = entityID;
  game.setEntityHeading(entityID, heading);
  return entityID;
}

function deleteSpeedCam(speedCamID){
  game.deleteEntity(camDict[speedCamID]);
  camDict[speedCamID] = undefined;
}

function deleteOwnSpeedCam(){
  alt.emitServer("speedcam:deleteown");
}

function startUseAnimation(){
  game.requestAnimDict("amb@world_human_binoculars@male@base");
  alt.log(game.isEntityPlayingAnim(alt.Player.local.scriptID, "amb@world_human_binoculars@male@base", "base", 3));
  game.taskPlayAnim(alt.Player.local.scriptID, "amb@world_human_binoculars@male@base", "base", 8.0, 1.0, -1, 1, 1.0, 0, 0, 0);
  alt.log(game.isEntityPlayingAnim(alt.Player.local.scriptID, "amb@world_human_binoculars@male@base", "base", 3));  // TODO Warum hier auch false? Später benutzen für Zustandscheck
}

function showNotification(message, backgroundColor = null, notifImage = null, iconType = 0, title = "Title", subtitle = "subtitle", durationMult = 1) {
  game.beginTextCommandThefeedPost('STRING');
  game.addTextComponentSubstringPlayerName(message);
  if (backgroundColor != null)
    game.thefeedSetNextPostBackgroundColor(backgroundColor);
  if (notifImage != null)
    game.endTextCommandThefeedPostMessagetextTu(notifImage, notifImage, true, iconType, title, subtitle, durationMult);
  return game.endTextCommandThefeedPostMpticker(false, true);
}