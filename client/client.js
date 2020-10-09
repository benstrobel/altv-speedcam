import * as alt from 'alt';
import * as game from 'natives';

// ---------------------------------------- Configuration ------------------------------------------

const germanOutputDict={
  "showHintConnect": `Drücke ${speedCamInteractButton} um den Blitzer mit deinem Handy zu verbinden`,
  "showHintDisconnect": `Drücke ${speedCamInteractButton} um den Blitzer von deinem Handy zu trennen`,
  "showHintConnected": `Dein Handy ist jetzt mit dem Blitzer verbunden. Drücke ${speedCamInteractButton} um die Verbindung zu trennen`,
  "showHintDisconnected": "Dein Handy ist jetzt vom Blitzer getrennt",
  "showHintVehicleDetected0": "Fahrzeug mit Nummernschild:",
  "showHintVehicleDetected1": "fährt",
  "showHintVehicleDetected2": speedUnitString
}

const englishOutputDict={
  "showHintConnect": `Press ${speedCamInteractButton} to connect your phone to the speedcam`,
  "showHintDisconnect": `Press ${speedCamInteractButton} to disconnect your phone from the speedcam`,
  "showHintConnected": `Your phone is now connected to the speedcam. Press ${speedCamInteractButton} to disconnect`,
  "showHintDisconnected": "Your phone is now disconnected from the speedcam",
  "showHintVehicleDetected0": "Vehicle with license plate:",
  "showHintVehicleDetected1": "is driving",
  "showHintVehicleDetected2": speedUnitString
}

const toKmH = 3.6;
const toMpH = 2.23693;
const kmHString = "kmh";
const mpHString = "mph";

const useKmH = true;

const speedCamInteractButton = "E";
const gtaSpeedToRealSpeedFactor = useKmH ? toKmH : toMpH;
const speedUnitString = useKmH ? kmHString : mpHString;

const languageOutputDict = englishOutputDict;

const makeSpeedcamsStatic = true;

// ---------------------------------------- Internal Functionality ------------------------------------------

var camDict = {}

alt.onServer('speedcam:spawn', (speedcamID, pos, heading) => {
  spawnSpeedCam(speedcamID, pos, heading);
});

alt.onServer('speedcam:delete', (speedCamID) => {
  deleteSpeedCam(speedCamID);
});

alt.onServer('speedcam:showusehint', (status) => {
  if(status){
    showNotification(`${languageOutputDict["showHintDisconnect"]}`, null, "DIA_POLICE", 7, "Speedcam", "", 0.3);
  }else{
    showNotification(`${languageOutputDict["showHintConnect"]}`, null, "DIA_POLICE", 7, "Speedcam", "", 0.3);
  }
});

alt.onServer('speedcam:usecam', (status) => {
  if(status){
    showNotification(`${languageOutputDict["showHintConnected"]}`, null, "DIA_POLICE", 7, "Speedcam", "", 0.3);
  }else{
    showNotification(`${languageOutputDict["showHintDisconnected"]}`, null, "DIA_POLICE", 7, "Speedcam", "", 0.3);
  }
  
});

alt.onServer('speedcam:vehicleInDetectZone', (detectedEntityID, licensePlateText) => {
  var isPlayerCurrentlyUsingCam = true;
  if(isPlayerCurrentlyUsingCam){
    var detectedvehicle = alt.Vehicle.getByID(detectedEntityID);
    showNotification(`${languageOutputDict["showHintVehicleDetected0"]} \"${licensePlateText}\" ${languageOutputDict["showHintVehicleDetected1"]} ${Math.round(game.getEntitySpeed(detectedvehicle.scriptID)*gtaSpeedToRealSpeedFactor)} ${languageOutputDict["showHintVehicleDetected2"]}`, null, "DIA_POLICE", 7, "Speedcam", "", 0.5);
  }else{
    alt.emitServer('speedcam:notusinganymore');
  }
});


function spawnSpeedCam(speedcamID, pos, heading){
  const entityID = game.createObjectNoOffset(1355733718,pos.x,pos.y,pos.z);
  camDict[speedcamID] = entityID;
  game.setEntityHeading(entityID, heading);
  if(makeSpeedcamsStatic){
    game.freezeEntityPosition(entityID,true);
  }
  return entityID;
}

function deleteSpeedCam(speedCamID){
  game.deleteEntity(camDict[speedCamID]);
  camDict[speedCamID] = undefined;
}

// ---------------------------------------- External Functionality ------------------------------------------

export function deleteOwnSpeedCam(){
  alt.emitServer("speedcam:deleteown");
}

export function placeSpeedCam() {
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
}

export function useButtonFunction() {
  alt.emitServer("speedcam:use");
}

// ---------------------------------------- Own Notification Function, Replace when needed ------------------------------------------

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