export default class Visualizer{
    static drawNetwork(ctx,network, left, top, width, height, radius = 14){
        const margin=50;
        const lerp=(a,b,t)=>a+(b-a)*t;

        const levelHeight=height/network.levels.length;

        for(let i=network.levels.length-1;i>=0;i--){
            const levelTop=top+
                lerp(
                    height-levelHeight,
                    0,
                    network.levels.length==1
                        ?0.5
                        :i/(network.levels.length-1)
                );

            ctx.setLineDash([7,3]);
            Visualizer.drawLevel(
                ctx,
                radius,
                network.levels[i],
                left,levelTop,
                width,levelHeight,
                i==network.levels.length-1
                    ?['⬆','⬅', '➡' ,'⬇']
                    :[]
            );
        }
    }

    static drawLevel(ctx, radius, level,left,top,width,height,outputLabels){
        const right=left+width;
        const bottom=top+height;
        const nodeRadius=radius;
        const {inputs,outputs,weights,biases}=level;
        const getRGBA = (value) => {
            const alpha=Math.abs(value);
            const R=value<0?0:255;
            const G=R;
            const B=value>0?0:255;
            return `rgba(${R}, ${G}, ${B}, ${alpha}`;
        }

        for(let i=0;i<inputs.length;i++){
            for(let j=0;j<outputs.length;j++){
                ctx.beginPath();
                ctx.moveTo(
                    Visualizer.#getNodeX(inputs,i,left,right),
                    bottom
                );
                ctx.lineTo(
                    Visualizer.#getNodeX(outputs,j,left,right),
                    top
                );
                ctx.lineWidth=2;
                ctx.strokeStyle=getRGBA(weights[i][j]);
                ctx.stroke();
            }
        }

        for(let i=0;i<inputs.length;i++){
            const x=Visualizer.#getNodeX(inputs,i,left,right);
            ctx.beginPath();
            ctx.arc(x,bottom,nodeRadius,0,Math.PI*2);
            ctx.fillStyle="black";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x,bottom,nodeRadius*0.6,0,Math.PI*2);
            ctx.fillStyle=getRGBA(inputs[i]);
            ctx.fill();

            // add rays identifiers
            // ctx.textAlign="center";
            // ctx.textBaseline="middle";
            ctx.fillStyle="#0095ff";
            ctx.strokeStyle="#0069ff";
            ctx.font=(nodeRadius*0.7)+"px Mouse";
            ctx.fillText(String(i),x - nodeRadius*0.25,bottom+nodeRadius*0.25);
        }

        for(let i=0;i<outputs.length;i++){
            const x=Visualizer.#getNodeX(outputs,i,left,right);
            ctx.beginPath();
            ctx.arc(x,top,nodeRadius,0,Math.PI*2);
            ctx.fillStyle="black";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x,top,nodeRadius*0.6,0,Math.PI*2);
            ctx.fillStyle=getRGBA(outputs[i]);
            ctx.fill();

            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.arc(x,top,nodeRadius*0.8,0,Math.PI*2);
            ctx.strokeStyle=getRGBA(biases[i]);
            ctx.setLineDash([3,3]);
            ctx.stroke();
            ctx.setLineDash([]);

            if(outputLabels[i]){
                ctx.beginPath();
                ctx.fillStyle="#00a5ff";
                ctx.strokeStyle="#0069ff";
                ctx.font=(nodeRadius*0.5)+"px Mouse";
                ctx.fillText(outputLabels[i],x - nodeRadius*0.25,top+nodeRadius*0.25);
                ctx.strokeText(outputLabels[i],x - nodeRadius*0.25,top+nodeRadius*0.25);
            }
        }
    }

    static #getNodeX(nodes,index,left,right){
        const lerp=(a,b,t)=>a+(b-a)*t;
        return lerp(
            left,
            right,
            nodes.length==1
                ?0.5
                :index/(nodes.length-1)
        );
    }
}