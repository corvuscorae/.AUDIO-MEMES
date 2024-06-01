class NoFade extends Phaser.Scene {
    constructor() {
        super("NoFade");
    }

    preload(){ }

    init() {
        console.log("NoFade");

        this.endScene = false;
        
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
        this.layer.setScale(0.75);
        
        document.getElementById('description').innerHTML = 
        "<h2>noFade.js<br> > press ENTER to restart scene<br> > press SPACE to start next scene</h2>";
    }

    create() {
        this.physics.world.drawDebug = false;
        this.init();

        this.bg_music = this.sound.add("bg_music", {
            volume: 1,
            rate: 1,
            detune: 0,
            loop: true
        });
        if(!this.bg_music.isPlaying) this.bg_music.play();
        
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
        // reset scene
        if (Phaser.Input.Keyboard.JustDown(this.enter)) {
            this.endScene = true; this.nextScene = this;
        }
        // next scene
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            this.endScene = true; this.nextScene = "Fade";
        }

        this.exitScene(this.endScene, this.nextScene);
    }

    exitScene(active, nextScene){
        if(active){
            // restart this scene
            this.bg_music.stop();
            this.scene.start(nextScene);
        }
    }
}