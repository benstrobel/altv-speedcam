import * as alt from 'alt';
import * as game from 'natives';

alt.log('Client-side has loaded!');

const speedCamKey = 'X';

alt.onServer('Server:Log', (msg1, msg2) => {
    alt.log(`Message From Server: ${msg1}`);
    alt.log(`Message From Server: ${msg2}`);
});

alt.on('keydown', (key) => {
    if (alt.gameControlsEnabled()) {
      if (key === speedCamKey.charCodeAt(0)) {
        alt.log("Keydown");
        var playerPos = game.getEntityCoords(game.playerPedId());
        var player = alt.Player.local;
        var playerForwardVector = game.getEntityForwardVector(player.scriptID);
        var heading = game.getEntityHeading(player.scriptID) + 180;
        var result = {
          x: playerPos.x + playerForwardVector.x * 1,
          y: playerPos.y + playerForwardVector.y * 1,
          z: playerPos.z + playerForwardVector.z * 1
        }
        alt.emitServer("serverSpawnSpeedCam", result, heading);
        alt.log("Client Server Spawn Cam");
      }
    }
  });

alt.onServer('clientSpawnSpeedCam', (pos, heading) => {
  if(alt.Player.local.hasMeta("speedCamID")){
    deleteSpeedCam();
    spawnSpeedCam();
  }else{
    spawnSpeedCam();
  }
});

alt.onServer('clientDeleteSpeedCam', (speedCamID) => {
  game.deleteEntity(alt.Player.local.getMeta("speedCamID"));
});

function deleteSpeedCam(entityID){
  game.deleteEntity(alt.Player.local.getMeta("speedCamID"));
  alt.emitServer("serverDeleteSpeedCam", alt.Player.local.getMeta("speedCamID"));
  alt.Player.local.deleteMeta("speedCamID");
}

function spawnSpeedCam(){
  alt.log("Client Client Spawn Cam")
    const entityID = game.createObjectNoOffset(1355733718,pos.x,pos.y,pos.z);
    game.setEntityHeading(entityID, heading);
    alt.Player.local.setMeta("speedCamID", entityID);
    return entityID;
}