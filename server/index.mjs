import * as alt from 'alt-server';
import chat from 'chat';

var camDict = {};

alt.on('playerDeath', (player) => {
    player.spawn(813, -279, 66, 5000);
    player.giveWeapon(2210333304, 100, true);
});

alt.onClient('speedcam:spawn', (player, pos, playerpos, heading) => {
    alt.emitClient(null, "speedcam:spawn", pos, heading);
    const useCircle = new alt.ColshapeCircle(playerpos.x,playerpos.y,1);
    camDict[player.id] = useCircle;
});

alt.onClient('speedcam:delete', (player, entityID) =>{
    alt.emitClient(null, "speedcam:delete", entityID);
    camDict[entityID] = undefined;
});

alt.on('entityEnterColshape', (colshape, entity) => {
    var values = Object.keys(camDict).map(function(key){
        return camDict[key];
    });
    if(entity instanceof alt.Player && values.indexOf(colshape) != -1){
        alt.emitClient(entity, "speedcam:showusehint");
    }
});

alt.onClient('speedcam:use', (player) => {
    if (camDict[player.id].isEntityIn(player)){
        alt.emitClient(player, "speedcam:usecam");
    }
});
