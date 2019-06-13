package util

import (
	"os"
	"reflect"
)

//EnsureFolder checks to see if a folder at a given path exists. Creates it if not!
func EnsureFolder(folderPath string) {
	if _, err := os.Stat(folderPath); os.IsNotExist(err) {
		os.Mkdir(folderPath, 0777)
	}
}

//DeleteFolder removes a folder and all of it's contents
func DeleteFolder(folderPath string) {
	os.RemoveAll(folderPath)
}

//Contains returns whether a slice contains a given value.
func Contains(slice interface{}, val interface{}) bool {
	sv := reflect.ValueOf(slice)

	for i := 0; i < sv.Len(); i++ {
		if sv.Index(i).Interface() == val {
			return true
		}
	}
	return false
}
