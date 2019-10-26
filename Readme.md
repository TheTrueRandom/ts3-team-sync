# ts3 team sync

## Usage
set envs:  
`HOST` - Hostname of the ts3 server  
`PASSWORD` - Password of the ts3 'serveradmin' account
 

create userMappings.json

```
[
  {
    "ts3Id": "<uniqueIdentifier of ts3 client>",
    "ids": [
      "<id corresponding to that user (e.g. nickname, steamId, ...)>"
    ]
  }
]
```

http post to `/syncteams` to trigger ts3 sync users of team to different channels
```
[
  {
    "team": <1 or 2>,
    "id": "<some id for the user (userMappings ids should contain this id)>"
  }	
]
```
