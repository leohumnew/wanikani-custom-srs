let stopRemainingScriptLoad = false;

// Class with utilities for performing the OAuth2.0 flow and for making requests to the Google Drive API.
class SyncManager {
    static #c = atob("") + "-" + atob(b) + ".apps.googleusercontent.com";
    static #s = atob("") + "-" + atob(a);
    static #r = "https://www.wanikani.com";
    
    static beginAuth() {
        Utils.log("beginAuth");
        let builtAuthURL = `https://accounts.google.com/o/oauth2/auth?client_id=${this.#c}&redirect_uri=${this.#r}&response_type=code&scope=https://www.googleapis.com/auth/drive.appdata&access_type=offline&prompt=consent`;
        window.open(builtAuthURL, "Log in", "resizeable, scrollbars, status, toolbar, dependent, width=480,height=660");
    }

    static async checkIfAuthed() {
        if(!CustomSRSSettings.userSettings.syncEnabled) return;

        let url = new URL(window.location.href);
        let authCode = url.searchParams.get("code");

        if(authCode) {
            stopRemainingScriptLoad = true;
            // If authenticating, cover the page with a loading screen
            let loadingScreen = "<div style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: var(--color-wk-panel-background, white); z-index: 1000;'><h1 id='loadingScreenText' style='position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%'>Loading...</h1></div>";
            Utils.log("Auth code found. Getting access token.");
            document.addEventListener("DOMContentLoaded", () => {
                document.body.innerHTML += loadingScreen;
                this.getAccessToken(authCode);
            });
        } else if(await GM.getValue("customSrsAccessToken")) {
            Utils.log("Google Drive Access Token found");
            if(await GM.getValue("customSrsDidReview")) {
                Utils.log("Review was done, saving data to Google Drive");
                this.saveDataToDrive(activePackProfile, "main", true);
                GM.deleteValue("customSrsDidReview");
            }
        } else {
            Utils.log("No auth code / access token found. Beginning auth.");
            SyncManager.beginAuth();
        }
    }

    static getLoadingScreenText() {
        return unsafeWindow.document.getElementById("loadingScreenText");
    }

    static getAccessToken(authCode) {
        let bodyTxt = `client_id=${encodeURIComponent(this.#c)}&` + atob("Y2xpZW50X3NlY3JldA==") +
        `=${encodeURIComponent(this.#s)}&` +
        `code=${encodeURIComponent(authCode)}&` +
        `grant_type=authorization_code&` +
        `redirect_uri=${encodeURIComponent(this.#r)}&` +
        `access_type=offline`;

        GM.xmlHttpRequest({
            method: "POST",
            url: "https://oauth2.googleapis.com/token",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: bodyTxt,
            onload: function(response) {
                if(response.status != 200) {
                    Utils.log("Error getting access token");
                    Utils.log(response);
                    CustomSRS_getLoadingScreenText().innerText = "Error getting access token";
                    return;
                }
                let responseJSON = JSON.parse(response.responseText);
                GM.setValue("customSrsAccessToken", responseJSON.access_token);
                GM.setValue("customSrsRefreshToken", responseJSON.refresh_token);
                GM.setValue("customSrsTokenExpires", Date.now() + responseJSON.expires_in * 1000);
                Utils.log("Google Drive Access Token received: " + responseJSON.access_token + ", expires in " + responseJSON.expires_in + " seconds, refresh token: " + responseJSON.refresh_token);
                CustomSRS_selectMasterSource(responseJSON.access_token);
            },
            onerror: function(response) {
                Utils.log("Error getting access token");
                Utils.log(response);
                CustomSRS_getLoadingScreenText().innerText = "Error getting access token";
            }
        });
    }

    static async selectMasterSource(accessToken) {
        let packProfile = await StorageManager.loadPackProfile("main");
        GM.xmlHttpRequest({
            method: "GET",
            url: "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='packProfiles__main.json'&fields=files(id,modifiedTime)",
            headers: {
                "Authorization": "Bearer " + accessToken
            },
            onload: function(response) {
                let files = JSON.parse(response.responseText).files;
                if(!files || files.length == 0) CustomSRS_getLoadingScreenText().innerText = "Please close this window and then refresh WaniKani to begin syncing.";
                else {
                    CustomSRS_getLoadingScreenText().innerHTML = `
                    <h2>Select Source</h2>
                    <p style="font-size: 40%">Choose which version of your data to keep - whichever you choose will overwrite the other. Whicever you do not choose will be permanently deleted.</p>
                    <button style="width: 100%" id="driveButton">Google Drive<br><small>Last modified: ${new Date(files[0].modifiedTime).toLocaleString()}</small></button>
                    <button style="width: 100%" id="localButton">Local</button>`;
                    document.getElementById("driveButton").addEventListener("click", () => {
                        GM.setValue("customSrsDriveFileId", files[0].id);
                        SyncManager.loadDataFromDrive("main", true);
                        // Wait for the data to be downloaded
                        let interval = setInterval(() => {
                            if(StorageManager.downloadedPackProfile != null) {
                                clearInterval(interval);
                                if(StorageManager.downloadedPackProfile == -1) {
                                    CustomSRS_getLoadingScreenText().innerText = "Error downloading file from Google Drive, please close this window and then refresh WaniKani, then go to settings and click 'force pull' to try again.";
                                    return;
                                }
                                CustomSRS_getLoadingScreenText().innerText = "Please close this window and then refresh WaniKani to begin syncing.";
                            }
                        }, 100);
                    });
                    document.getElementById("localButton").addEventListener("click", () => {
                        SyncManager.saveDataToDrive(packProfile, "main").then(() => {
                            CustomSRS_getLoadingScreenText().innerText = "Please close this window and then refresh WaniKani";
                        });
                    });
                }
            },
            onerror: function(response) {
                Utils.log("Error getting file metadata from Google Drive");
                Utils.log(response);
                CustomSRS_getLoadingScreenText().innerText = "Error getting file metadata from Google Drive";
            }
        });
    }

    static async refreshToken() {
        let refreshToken = await GM.getValue("customSrsRefreshToken")
        if(!refreshToken) {
            Utils.log("No refresh token found, please re-authenticate");
            return;
        }
        Utils.log("Refreshing token - " + refreshToken);

        let bodyTxt = `client_id=${encodeURIComponent(this.#c)}&` + atob("Y2xpZW50X3NlY3JldA==") +
        `=${encodeURIComponent(this.#s)}&` +
        `refresh_token=${encodeURIComponent(refreshToken)}&` +
        `grant_type=refresh_token`;

        await GM.xmlHttpRequest({
            method: "POST",
            url: "https://oauth2.googleapis.com/token",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: bodyTxt,
            onload: function(response) {
                let responseJSON = JSON.parse(response.responseText);
                GM.setValue("customSrsAccessToken", responseJSON.access_token);
                GM.setValue("customSrsTokenExpires", Date.now() + responseJSON.expires_in * 1000);
                Utils.log("Google Drive Access Token refreshed to " + responseJSON.access_token);
            },
            onerror: function(response) {
                Utils.log("Error refreshing access token");
                Utils.log(response);
            }
        });
    }

    static async saveDataToDrive(data, fileSuffix, forceSync = false) {
        // Check if review was done less than 3 seconds ago
        if(!forceSync && CustomSRSSettings.savedData.lastSynced > Date.now() - 3000) {
            Utils.log("Review was done less than 3 seconds ago, preventing API spam");
            return;
        }
        // Check if access token is expired
        let tokenExpires = await GM.getValue("customSrsTokenExpires");
        if (Date.now() > tokenExpires) {
            await this.refreshToken();
        }
        let accessToken = await GM.getValue("customSrsAccessToken");
        
        // Convert data object to JSON string
        let dataString = JSON.stringify(data);

        let fileId = await GM.getValue("customSrsDriveFileId");

        // Create file metadata
        let metadata = fileId ? {
            modifiedTime: new Date().toISOString()
        } : {
            name: 'packProfiles__' + fileSuffix + '.json',
            mimeType: 'application/json',
            parents: ['appDataFolder'],
            modifiedTime: new Date().toISOString()
        };

        // Save file to Google Drive
        GM.xmlHttpRequest({
            method: fileId ? "PATCH" : "POST",
            url: "https://www.googleapis.com/upload/drive/v3/files" + (fileId ? "/" + fileId : "") + "?uploadType=multipart",
            headers: {
                "Authorization": "Bearer " + accessToken,
                "Content-Type": "multipart/related; boundary=foo_bar_baz"
            },
            data: "--foo_bar_baz\r\n" +
                "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
                JSON.stringify(metadata) + "\r\n" +
                "--foo_bar_baz\r\n" +
                "Content-Type: application/json\r\n\r\n" +
                dataString + "\r\n" +
                "--foo_bar_baz--",
            onload: function(response) {
                if(response.status != 200) {
                    Utils.log("Error saving file to Google Drive");
                    Utils.log(response);
                    return;
                }
                Utils.log("File saved to Google Drive");
                if(fileId && fileId != JSON.parse(response.responseText).id) alert("File saved incorrectly - fileID mismatch. Please report this to the developer.");
                GM.setValue("customSrsDriveFileId", JSON.parse(response.responseText).id);
                StorageManager.updateLastSynced();
            },
            onerror: function(response) {
                Utils.log("Error saving file to Google Drive");
                Utils.log(response);
            }
        });
    }

    static async loadDataFromDrive(fileSuffix, forceSync = false) {
        StorageManager.downloadedPackProfile = null;
        let accessToken = await GM.getValue("customSrsAccessToken");
        if(!accessToken) {
            StorageManager.downloadedPackProfile = -1;
            return;
        }

        // Check if access token is expired
        let tokenExpires = await GM.getValue("customSrsTokenExpires");
        if (Date.now() > tokenExpires) {
            await this.refreshToken();
            accessToken = await GM.getValue("customSrsAccessToken");
        }

        let lastSync = CustomSRSSettings.savedData.lastSynced;

        // Get file metadata
        GM.xmlHttpRequest({
            method: "GET",
            url: "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='packProfiles__" + fileSuffix + ".json'&fields=files(id,modifiedTime)",
            headers: {
                "Authorization": "Bearer " + accessToken
            },
            onload: function(response) {
                let files = JSON.parse(response.responseText).files;
                if(!files) {
                    Utils.log("Error getting file metadata from Google Drive");
                    Utils.log(response);
                } else if (files.length > 0) {
                    let fileId = files[0].id;
                    let fileModifiedTime = new Date(files[0].modifiedTime).getTime();
                    Utils.log("File modified time: " + new Date(files[0].modifiedTime));
                    if (forceSync || fileModifiedTime > lastSync) {
                        // File has been modified, download the updated data
                        GM.xmlHttpRequest({
                            method: "GET",
                            url: "https://www.googleapis.com/drive/v3/files/" + fileId + "?alt=media",
                            headers: {
                                "Authorization": "Bearer " + accessToken
                            },
                            onload: function(response) {
                                if(response.status != 200) {
                                    Utils.log("Error downloading file from Google Drive");
                                    Utils.log(response);
                                    StorageManager.downloadedPackProfile = -1;
                                    return;
                                }
                                let data = JSON.parse(response.responseText);
                                StorageManager.downloadedPackProfile = data;
                                StorageManager.updateLastSynced();
                                Utils.log("File downloaded from Google Drive");
                            }
                        });
                    } else {
                        Utils.log("No updates found");
                        StorageManager.downloadedPackProfile = -1;
                        StorageManager.updateLastSynced();
                    }
                } else {
                    Utils.log("File not found on Google Drive, syncing for the first time");
                    StorageManager.downloadedPackProfile = -1;
                    StorageManager.savePackProfile(null, "main", true, true);
                }
            }
        });
    }

    static disableSync() {
        GM.deleteValue("customSrsAccessToken");
        GM.deleteValue("customSrsRefreshToken");
        GM.deleteValue("customSrsTokenExpires");
        GM.deleteValue("customSrsDriveFileId");
    }

    static setDidReview() {
        GM.setValue("customSrsDidReview", true);
    }
}

window.CustomSRS_selectMasterSource = SyncManager.selectMasterSource;
window.CustomSRS_getLoadingScreenText = SyncManager.getLoadingScreenText;