export default class Tools {
    constructor(app) {
        this.app = app;
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    random(min, max, floor = false) {
        const r = Math.random() * (max - min) + min;
        return floor ? Math.floor(r) : r;
    }

    xDecimals(n, x = 2) {
        return Math.round(n * Math.pow(10, x)) / Math.pow(10, x);
    }

    getIntersection(A, B, C, D) {
        const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
        const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
        const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

        if (bottom != 0) {
            const t = tTop / bottom;
            const u = uTop / bottom;
            if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
                return {
                    x: this.lerp(A.x, B.x, t),
                    y: this.lerp(A.y, B.y, t),
                    offset: t
                }
            }
        }

        return null;
    };

    polysIntersect(poly1, poly2) {
        for (let i = 0; i < poly1.length; i++) {
            for (let j = 0; j < poly2.length; j++) {
                const touch = this.getIntersection(
                    poly1[i],
                    poly1[(i + 1) % poly1.length],
                    poly2[j],
                    poly2[(j + 1) % poly2.length],
                )
                if (touch) {
                    return true;
                }
            }
        }
        return false;
    }

    getClickCoords = (e) => ({
        x: e.clientX / this.app.camera.viewport.scale[0] + this.app.camera.viewport.left,
        y: e.clientY / this.app.camera.viewport.scale[1] + this.app.camera.viewport.top
    })

    isPointInsidePolygon = (point, polygon) => {
        let isInside = false;
        let i = 0;
        let j = polygon.length - 1;

        for (; i < polygon.length; j = i++) {
            const x = {
                dividend: (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y),
                divisor: (polygon[j].y - polygon[i].y)
            }
            const condition1 = (polygon[i].y > point.y) !== (polygon[j].y > point.y);
            const condition2 = (point.x < x.dividend / x.divisor + polygon[i].x);

            if (condition1 && condition2) {
                isInside = !isInside;
            }
        }
        return isInside;
    }

    getEntityAt(click, collection) {
        for (let i = 0; i < collection.length; i++) {
            const entity = collection[i];

            if (entity.polygons instanceof Array) {
                const polysIntersect = this.isPointInsidePolygon(click, entity.polygons);
                if (polysIntersect)
                    return entity;
            }
        }
    }
}