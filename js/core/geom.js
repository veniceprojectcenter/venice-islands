//point = { x , y }
//polygon = point[]

//From http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment

//x: int
function sqr(x) { return x * x; }

// v,w : point
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y); }

//p,v   : point (line segment)
//w     : point (point being compared)
function distToSegmentSquared(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 == 0) return dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    if (t < 0) return dist2(p, v);
    if (t > 1) return dist2(p, w);
    return dist2(p, {
        x: v.x + t * (w.x - v.x),
        y: v.y + t * (w.y - v.y)
    });
}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }

function distToPolySquared(poly, point) { 
    var l = poly.length-1; 
    var min = null;
    for (var i = 0; i < l ; i++) {
        var d2 = distToSegmentSquared(poly[i],poly[i+1],point);
        if(min){
            if(d2<min){
                min=d2;
            }
        }
        else{
            min=d2;
        }
    }
}
function distToPoly(poly, point){ return Math.sqrt(distToPolySquared(poly,point)); }

// From http://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function

function CCW(p1, p2, p3) {
    a = p1.x; b = p1.y;
    c = p2.x; d = p2.y;
    e = p3.x; f = p3.y;
    return (f - b) * (c - a) > (d - b) * (e - a);
}

// p1,p2    : point (line 1)
// p3,p4    : point (line 2)

function isIntersect(p1, p2, p3, p4, epsilon) {
    epsilon = epsilon || 0.0;
    return ((CCW(p1, p3, p4) != CCW(p2, p3, p4)) && (CCW(p1, p2, p3) != CCW(p1, p2, p4)))||(dist2(p1,p3)<=epsilon)||(dist2(p1,p4)<=epsilon)||(dist2(p2,p3)<=epsilon)||(dist2(p2,p4)<=epsilon);
}
//function isIntersect(p1, p2, p3, p4) {
//    return ((CCW(p1, p3, p4) != CCW(p2, p3, p4)) && (CCW(p1, p2, p3) != CCW(p1, p2, p4))||(p1.x===p3.x&&p1.y===p3.y)||(p2.x===p3.x&&p2.y===p3.y)||(p1.x===p4.x&&p1.y===p4.y)||(p2.x===p4.x&&p2.y===p4.y));
//}
//function isIntersect(p1, p2, p3, p4) {
//    return (CCW(p1, p3, p4) != CCW(p2, p3, p4)) && (CCW(p1, p2, p3) != CCW(p1, p2, p4));
//}

//From http://geomalgorithms.com/a03-_inclusion.html

//    Input:  three points P0, P1, and P2
//    Return: >0 for P2 left of the line through P0 and P1
//            =0 for P2  on the line
//            <0 for P2  right of the line
function isLeft(p0, p1, p2) {
    return ((p1.x - p0.x) * (p2.y - p0.y)
            - (p2.x - p0.x) * (p1.y - p0.y));
}

//returns 0 if p1 is outside polygon poly
//p1    : point
//poly  : array of points (in order, make up a polygon)
function wn_PnPoly(P,poly)
{
    var wn = 0;    // the  winding number counter
    // loop through all edges of the polygon
    for (var i=0; i<(poly.length-1); i++) {   // edge from V[i] to  V[i+1]
        if (poly[i].y <= P.y) {          // start y <= P.y
            if (poly[i+1].y > P.y)      // an upward crossing
                if (isLeft( poly[i], poly[i+1], P) > 0)  // P left of  edge
                    ++wn;            // have  a valid up intersect
        }
        else {                        // start y > P.y (no test needed)
            if (poly[i+1].y  <= P.y)     // a downward crossing
                if (isLeft( poly[i], poly[i+1], P) < 0)  // P right of  edge
                    --wn;            // have  a valid down intersect
        }
    }
    return wn;
}

function pointInPoly(p1, poly) {
    return wn_PnPoly(p1, poly) != 0;;
}

//Quick check if objects can possibly intersect using bounding box
function possibleIntersect(min1, max1, min2, max2, epsilon) {
    epsilon = epsilon || 0.0;
    
    return !((max1.x+epsilon) < min2.x || (max2.x+epsilon) < min1.x ||
        (max1.y+epsilon) < min2.y || (max2.y+epsilon) < min1.y);
}

function polyInterset(poly1, poly2, epsilon) {
    epsilon = epsilon || 0.00002;
    var l1 = poly1.length-1;
    var l2 = poly2.length-1;
    if(pointInPoly(poly1[0],poly2))
        return 1;
    if(pointInPoly(poly2[0],poly1))
        return 1;

    for (var i1 = 0; i1 < l1 ; i1++) {
        for (var i2 = 0; i2 < l2; i2++) {
            if(possibleIntersect(poly1[i1],poly1[i1+1],poly2[i2],poly2[i2+1],epsilon*2)){
                if(isIntersect(poly1[i1],poly1[i1+1],poly2[i2],poly2[i2+1],epsilon)){
                    return 1;
                }
            }
        }
    }
    return 0;
}
