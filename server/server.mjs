import * as alt from 'alt-server';

let currentIndex = 0;

class Speedcam{
    constructor(owner, useColShape, detectColShape){
        this.speedcamID = currentIndex++;
        this.owner = owner;
        this.useColShape = useColShape;
        this.detectColShape = detectColShape;
        this.users = [];
    }
}

console.log('[Speedcam] Server-Side Loaded.');

var camDict = {}

alt.onClient('speedcam:spawn', (player, pos, playerpos, heading) => {
    if(getValuesOfDict(camDict).filter((speecam) => {
        return speecam.owner === player;
    }).length >= 1){
        deleteCamOfPlayer(player);
    }
    const useColShape = new alt.ColshapeCircle(playerpos.x,playerpos.y,1);
    const detectColShape = new alt.ColshapeCircle(playerpos.x,playerpos.y,20);
    const speedcam = new Speedcam(player,useColShape,detectColShape);
    useColShape.setMeta("speedcamID", speedcam.speedcamID);
    useColShape.setMeta("speedcamColShapeType", "use");
    detectColShape.setMeta("speedcamID", speedcam.speedcamID);
    detectColShape.setMeta("speedcamColShapeType", "detect");
    camDict[speedcam.speedcamID] = speedcam;
    alt.emitClient(null, "speedcam:spawn", speedcam.speedcamID, pos, heading);
});

alt.onClient('speedcam:deleteown', (player) =>{
    deleteCamOfPlayer(player);
});

alt.on('entityEnterColshape', (colshape, entity) => {
    if(colshape.hasMeta("speedcamID")&& colshape.getMeta("speedcamColShapeType") == "use" && entity instanceof alt.Player){
        alt.emitClient(entity, "speedcam:showusehint");
    }
    if(colshape.hasMeta("speedcamID") && colshape.getMeta("speedcamColShapeType") == "detect" && entity instanceof alt.Vehicle){
        var speedcam = camDict[colshape.getMeta("speedcamID")];
        speedcam.users.forEach( (user) => {
            alt.emitClient(user, "speedcam:vehicleInDetectZone", entity.id, entity.numberPlateText);
        });
        alt.log(`Vehicle with licence palte ${entity.numberPlateText} was detected`)
    }
});

alt.onClient('speedcam:use', (player) => {
    var success = false;
    getValuesOfDict(camDict).filter((speedcam) => {
        return speedcam.useColShape.isEntityIn(player);
    }).forEach((speedcam) => {
        success = true;
        speedcam.users.push(player);
    });
    if (success){
        alt.emitClient(player, "speedcam:usecam");
    }
});

alt.onClient('speedcam:notusinganymore', (player) => {
    removeUserFromAllCams(player);
});

alt.on('playerDisconnect', (player) => {
    deleteCamOfPlayer(player);
    removeUserFromAllCams(player);
});

function removeUserFromAllCams(player){
    getValuesOfDict(camDict).forEach((speedcam) => {
        speedcam.users = speedcam.users.filter((user) => {
            return user !== player;
        });
    });
}

function deleteCamOfPlayer(player){
    getValuesOfDict(camDict).filter((speedcam) => {
        if (speedcam.player === player){
            alt.emitClient(null, "speedcam:delete", speedcam.speedcamID);
            camDict[speedcam.speedcamID] = undefined;
            return true;
        }else{
            return false;
        }
    });
}

function applyFuncToKeyValue(dict, func){
    Object.keys(dict).forEach((key) => {
        func(key,dict[key]);
    });
}

function getValuesOfDict(dict){
    return Object.keys(dict).map((key) => {
        return dict[key];
    });
}
