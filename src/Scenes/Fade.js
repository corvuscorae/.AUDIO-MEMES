class Fade extends Phaser.Scene {
    constructor() {
        super("Fade");
    }

    preload(){ }

    init() {
        console.log("Fade");

        this.endScene = false;

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
        this.map = this.add.tilemap("level", 16, 16, 60, 60);

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
        "<h2>Fade.js<br> > press ENTER to restart scene<br> > press SPACE to start next scene</h2>";
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
        
        let x = 1; let y = 1;
        for(let tileset of this.tileSets){
            for(let tileID = tileset.firstgid; tileID <= tileset.firstgid+tileset.total; tileID++){
                let props = tileset.getTileProperties(tileID);  
                if(!props){ continue; }
                for(let prop in props){
                    if(prop == "collides"){  
                        this.map.putTileAt(tileID, x, y, true, this.layer);
                        x++;
                    }
                }
            }
            x = 1; y += 2;
        }
        
    }

    update() {
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
            this.endScene = true; this.nextScene = "Spatial";
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