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

alt.onClient('speedcam:spawn', (player, pos, forwardvector, heading) => {
    if(getValuesOfDict(camDict).filter((speecam) => {
        return speecam.owner === player;
    }).length >= 1){
        deleteCamOfPlayer(player);
    }
    const useColShape = new alt.ColshapeCircle(pos.x,pos.y,2);
    var result = {
        x: pos.x + forwardvector.x * 40,
        y: pos.y + forwardvector.y * 40,
        z: pos.z + forwardvector.z * 40
      }
    const detectColShape = new alt.ColshapeCylinder(result.x,result.y,result.z-20,40, 100);
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
        var status = camDict[colshape.getMeta("speedcamID")].users.indexOf(entity) != -1;
        alt.emitClient(entity, "speedcam:showusehint", status);
    }
    if(colshape.hasMeta("speedcamID") && colshape.getMeta("speedcamColShapeType") == "detect" && entity instanceof alt.Vehicle){
        var speedcam = camDict[colshape.getMeta("speedcamID")];
        speedcam.users.forEach( (user) => {
            alt.emitClient(user, "speedcam:vehicleInDetectZone", entity.id, entity.numberPlateText);
        });
    }
});

alt.onClient('speedcam:use', (player) => {
    var success = false;
    var status = false;
    getValuesOfDict(camDict).filter((speedcam) => {
        return speedcam.useColShape.isEntityIn(player);
    }).forEach((speedcam) => {
        if (speedcam.users.indexOf(player) != -1){
            status = false;
            success = true;
            speedcam.users = speedcam.users.filter((user) => {return user != player;})
        }else{
            success = true;
            status = true;
            speedcam.users.push(player);
        }
    });
    if (success){
        alt.emitClient(player, "speedcam:usecam", status);
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
    getValuesOfDict(camDict).forEach((speedcam) => {
        if (speedcam.owner === player){
            alt.emitClient(player, "speedcam:delete", speedcam.speedcamID);
            camDict[speedcam.speedcamID].useColShape.destroy()
            camDict[speedcam.speedcamID].detectColShape.destroy()
            delete camDict[speedcam.speedcamID];
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
