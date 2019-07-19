
// Recursive array comparison
export function arrayEq(a: any, b: any) {
	if (a instanceof Array && b instanceof Array) {
		if (a.length !== b.length)  // assert same length
			return false;
		for (let i = 0; i < a.length; i++)  // assert each element equal
			if (!arrayEq(a[i], b[i]))
				return false;
		return true;
	} else {
		return a === b;  // if not both arrays, should be the same
	}
}
