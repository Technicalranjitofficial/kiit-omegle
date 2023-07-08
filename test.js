const ap = new Map();
const userid1 = 1;
const userid2 = 2;

ap.set(userid1,userid2);
ap.set(2,3);
ap.set(4,3);
ap.set(6,7);


const fun=()=>{
 console.log(ap.values())
}

fun();