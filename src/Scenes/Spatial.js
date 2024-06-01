class Spatial extends Phaser.Scene {
    constructor() {
        super("Spatial");
    }

    preload(){ }

    init() {
        console.log("Spatial");

        this.endScene = false;

        this.distance = { x: 0, y: 0, vect: 0, max: 0};
        //this.distance = 0;

        // variables and settings
        this.ACCELERATION = 500;
        this.DRAG = 6000;    // DRAG < ACCELERATION = icy slide
        this.GRAVITY = 2000;
        this.physics.world.gravity.y = this.GRAVITY;
        this.JUMP_VELOCITY = -600;
        this.SCALE = 2.0;
        
        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();
        this.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // create map (from tilemap)
        this.TILESIZE = 16;
        this.map = this.add.tilemap("level", this.TILESIZE, this.TILESIZE, 60, 60);

        // tilesets
        this.tiles_brown       = this.map.addTilesetImage("Brown_Tile_Terrain", "brown tile");
        this.tiles_grey        = this.map.addTilesetImage("Gray_Tile_Terrain", "gray tile");
        this.tiles_scaff_bg    = this.map.addTilesetImage("Scaffolding_and_BG_Parts", "scaffolding + bg");
    
        this.tileSets = [this.tiles_brown, this.tiles_grey, this.tiles_scaff_bg];
   
        /* CAMERA */
        this.cameras.main.setBounds(0,0,this.map.widthInPixels*2,this.map.heightInPixels*2);

        /* set physics bounds */
        this.physics.world.setBounds(0,0,this.map.widthInPixels*2,this.map.heightInPixels*2);    

        this.layer = this.map.createLayer("Platforms", this.tileSets, 0, 0);
        
        document.getElementById('description').innerHTML = 
        "<h2>Spatial.js<br> > press ENTER to restart scene<br> > press SPACE to start next scene<br> > CLICK to move target</h2>";
    }

    create() {
        this.physics.world.drawDebug = false;
        this.init();

        this.bg_music = this.sound.add("bg_music", {
            volume: 0,
            rate: 1,
            detune: 0,
            loop: true
        });
        this.bg_music.targetVolume = 1;
        if(!this.bg_music.isPlaying) this.bg_music.play();
        this.startMusic = true;
        this.stopMusic = false;
        
        let x = this.map.width/2; let y = this.map.height/2;;
        for(let tileset of this.tileSets){
            for(let tileID = tileset.firstgid; tileID <= tileset.firstgid+tileset.total; tileID++){
                let props = tileset.getTileProperties(tileID);  
                if(!props){ continue; }
                for(let prop in props){
                    if(prop == "target"){  
                        this.target = this.physics.add.staticSprite( // alien in UFO
                            x*this.TILESIZE, y*this.TILESIZE,
                            "platformer_characters", "tile_0006.png")
                            .setScale(2).setGravity(0).setOrigin(0.5);
                    }
                }
            }
        }

        this.distance.max = 
            Math.sqrt(  Math.pow((this.map.widthInPixels), 2) + 
                        Math.pow((this.map.heightInPixels), 2));

        let target = this.target;
        let distance = this.distance;
        let music = this.bg_music;
        
        /*  when mouse position changes, compute the distance between 
        //  the pointer and the target                                  
        //      d=√((x2 – x1)² + (y2 – y1)²)                        */
        // ISSUES:  - static sound when points moves quickly
        //          - light popping when placing target
        //          - popping on scene load??? wtf
        
        this.input.on('pointermove', function (pointer) {
            distance.x = pointer.x - target.x;
            distance.y = pointer.y - target.y;
            distance.vect = Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));
        
            music.targetVolume = 1.1 - (distance.vect / distance.max);
            console.log("!!!" + music.targetVolume);
            this.startMusic = true;
        });
        
        this.mouseDown = this.input.on('pointerdown', (pointer) => {
            target.x = pointer.x;
            target.y = pointer.y;

            distance.x = pointer.x - target.x;
            distance.y = pointer.y - target.y; 
            distance.vect = Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));

            music.targetVolume = 1.1;
            console.log("!!!" + music.targetVolume);
            this.startMusic = true;
        });
    }

    update() {
        // while not ending the scene, set volume based on distance
        if(!this.endScene){ 
            this.bg_music.setVolume(this.bg_music.targetVolume); 
        }

        if(this.startMusic == true){
            this.fade(this.bg_music, this.bg_music.targetVolume, 0.05);
        }
        if(this.bg_music.volume >= this.bg_music.targetVolume){ this.startMusic = false; }
            
        if(this.stopMusic == true){
            this.fade(this.bg_music, 0, 0.01);
        }
        
        // reset scene
        if (Phaser.Input.Keyboard.JustDown(this.enter)) {
            this.endScene = true; this.nextScene = this;
        }
        // next scene
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            this.endScene = true; this.nextScene = "NoFade";
        }
        this.exitScene(this.endScene, this.nextScene);
    }

    fade(sound, target, rate){
        let volume = sound.volume;
        if(volume > target){ sound.volume -= rate; } 
        else if(volume < target){ sound.volume += rate; } 
    }

    exitScene(active, nextScene){
        if(active){// fade out bg_music
            this.stopMusic = true;
            // restart this scene
            if(this.bg_music.volume <= 0){ 
                this.bg_music.stop();
                this.scene.start(nextScene); 
            }
        }
    }
}