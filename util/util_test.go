package util

import "testing"

func TestFolderEditing(t *testing.T) {
	folderPath := "./testfolder/"
	EnsureFolder(folderPath)
	DeleteFolder(folderPath)
}
