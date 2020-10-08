import * as alt from 'alt';
import * as game from 'natives';

alt.log('Client-side has loaded!');

const speedCamPlaceKey = 'B';
const speedCamUseKey = 'E';

var camDict = {}

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
        alt.emitServer("speedcam:spawn", result, playerForwardVector, heading);
        alt.log("Client Server Spawn Cam");
      }
      if(key === speedCamUseKey.charCodeAt(0)){
        alt.emitServer("speedcam:use");
        alt.log("Client Use Cam");
      }
    }
  });

alt.onServer('speedcam:spawn', (speedcamID, pos, heading) => {
  spawnSpeedCam(speedcamID, pos, heading);
});

alt.onServer('speedcam:delete', (speedCamID) => {
  deleteSpeedCam(speedCamID);
});

alt.onServer('speedcam:showusehint', (status) => {
  if(status){
    showNotification('Drücke E um den Blitzer von deinem Handy zu trennen', null, "DIA_POLICE", 7, "Speedcam", "", 0.3);
  }else{
    showNotification('Drücke E um den Blitzer mit deinem Handy zu verbinden', null, "DIA_POLICE", 7, "Speedcam", "", 0.3);
  }
});

alt.onServer('speedcam:usecam', (status) => {
  if(status){
    showNotification('Dein Handy ist jetzt mit dem Blitzer verbunden. Drücke E um die Verbindung zu trennen.', null, "DIA_POLICE", 7, "Speedcam", "", 0.3);
  }else{
    showNotification('Dein Handy ist jetzt vom Blitzer getrennt.', null, "DIA_POLICE", 7, "Speedcam", "", 0.3);
  }
  
});

alt.onServer('speedcam:vehicleInDetectZone', (detectedEntityID, licensePlateText) => {
  var isPlayerCurrentlyUsingCam = true;
  if(isPlayerCurrentlyUsingCam){
    var detectedvehicle = alt.Vehicle.getByID(detectedEntityID);
    showNotification(`Fahrzeug mit Nummernschild: \"${licensePlateText}\" fährt ${Math.round(game.getEntitySpeed(detectedvehicle.scriptID)*3.6)} Km/h`, null, "DIA_POLICE", 7, "Speedcam", "", 0.5);
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

function showNotification(message, backgroundColor = null, notifyImage = null, iconType = 0, title = "Title", subtitle = "subtitle", durationMult = 1) {
  game.beginTextCommandThefeedPost('STRING');
  game.addTextComponentSubstringPlayerName(message);
  if (backgroundColor != null)
    game.thefeedSetNextPostBackgroundColor(backgroundColor);
  if (notifyImage != null)
  if(!game.hasStreamedTextureDictLoaded(notifyImage)){
    game.requestStreamedTextureDict(notifyImage);
  }
  game.endTextCommandThefeedPostMessagetextTu(notifyImage, notifyImage, true, iconType, title, subtitle, durationMult);
  return game.endTextCommandThefeedPostMpticker(false, true);
}