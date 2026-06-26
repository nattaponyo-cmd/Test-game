/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { GameSettings, Keybindings } from "../types";
import { sound } from "../utils/sound";
import { 
  Play, 
  RotateCcw, 
  Trophy, 
  Heart, 
  Home, 
  Pause,
  Gamepad2,
  Compass,
  Zap,
  Sparkles
} from "lucide-react";
import * as THREE from "three";

interface GameScreenProps {
  settings: GameSettings;
  onExit: () => void;
}

interface Particle3D {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

interface Collectible3D {
  id: number;
  type: "mask" | "bell" | "rice";
  startX: number;
  startZ: number;
  mesh: THREE.Group;
  collected: boolean;
  light?: THREE.PointLight;
}

interface SpiritEnemy3D {
  id: number;
  startX: number;
  startZ: number;
  speed: number;
  range: number;
  angle: number;
  pattern: "circle" | "line";
  mesh: THREE.Group;
  light?: THREE.PointLight;
  hp: number;
  isKnockedBack: boolean;
  knockbackX: number;
  knockbackZ: number;
  knockbackTimer: number;
  isDead: boolean;
  deadVelocityX: number;
  deadVelocityY: number;
  deadVelocityZ: number;
  deadTimer: number;
  flashColor: "none" | "red" | "white" | "white_rapid";
  attackCooldown: number;
  isAttacking: boolean;
  attackTimer: number;
  currentFrame: number;
  animTimer: number;
  currentRow: number;
}

interface ThornObstacle3D {
  x: number;
  z: number;
  mesh: THREE.Mesh;
}

interface GrassProp3D {
  id: number;
  startX: number;
  startZ: number;
  mesh: THREE.Mesh;
  targetScaleY: number;
  currentScaleY: number;
  baseHeight: number;
  baseWidth: number;
}

const ENDING_DIALOGUES = [
  {
    speaker: "พ่อแสน",
    side: "right" as const,
    text: "โอ้! เจ้าผีตาโขนน้อย! เจ้าทำสำเร็จแล้ว! ข้าเห็นการต่อสู้เมื่อครู่ ช่างกล้าหาญยิ่งนัก!",
    avatar: "https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440017/npc1_kgr83q.png",
  },
  {
    speaker: "ผีตาโขนน้อย",
    side: "left" as const,
    text: "พญาผีหลวงแข็งแกร่งมากเลยครับพ่อแสน! เกือบจะต้านทานไม่ไหวแล้วครับ",
    avatar: "https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440018/player_mask_srkmbt.png",
  },
  {
    speaker: "พ่อแสน",
    side: "right" as const,
    text: "ถ้าไม่ใช่เพราะความสามารถในการระบำขับร่ายเวทและพลังจิตวิญญาณอันแน่วแน่ของเจ้า เมืองด่านซ้ายแห่งนี้คงสูญสิ้นแล้ว",
    avatar: "https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440017/npc1_kgr83q.png",
  },
  {
    speaker: "ผีตาโขนน้อย",
    side: "left" as const,
    text: "ผมเพียงแค่อยากปกป้องวัฒนธรรมด่านซ้ายอันล้ำค่า และนำเครื่องสักการะกลับคืนสู่วัดเนรมิตวิปัสสนาให้ครบครับ!",
    avatar: "https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440018/player_mask_srkmbt.png",
  },
  {
    speaker: "พ่อแสน",
    side: "right" as const,
    text: "เครื่องสักการะโบราณ ทั้งหน้ากาก กระดิ่ง และกระติบข้าวเหนียวที่เจ้าสะสมมา ได้ช่วยสะกดวิญญาณชั่วร้ายไม่ให้ตื่นขึ้นมาอีกตลอดกาล!",
    avatar: "https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440017/npc1_kgr83q.png",
  },
  {
    speaker: "ผีตาโขนน้อย",
    side: "left" as const,
    text: "เย้! เมืองด่านซ้ายของพวกเราจะกลับมาสงบสุข และมีเสียงกระดิ่งดังกังวานต้อนรับงานรื่นเริงแสนสนุกอีกครั้งแล้วสิครับ!",
    avatar: "https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440018/player_mask_srkmbt.png",
  },
  {
    speaker: "พ่อแสน",
    side: "right" as const,
    text: "ใช่แล้วล่ะ! ชาวเมืองทุกคนกำลังเตรียมจัดขบวนแห่ผีตาโขนเฉลิมฉลองสุดอลังการ เพื่อต้อนรับและชื่นชมชัยชนะอันยิ่งใหญ่ของเจ้า!",
    avatar: "https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440017/npc1_kgr83q.png",
  },
  {
    speaker: "พ่อแสน",
    side: "right" as const,
    text: "จงก้าวข้ามผ่านประตูวาร์ปทองคำแห่งนี้เพื่อเข้าสู่วัดเนรมิตวิปัสสนาเถิด เจ้าคือวีรบุรุษตัวจริงของพวกเราทุกคน!",
    avatar: "https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440017/npc1_kgr83q.png",
  },
];

export default function GameScreen({ settings, onExit }: GameScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  // React HUD States
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [gameState, setGameState] = useState<"playing" | "paused" | "gameover" | "victory" | "ending">("playing");
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [showDialogue, setShowDialogue] = useState(false);
  const [fps, setFps] = useState(60);
  const [collectiblesCollected, setCollectiblesCollected] = useState({ mask: 0, bell: 0, rice: 0 });
  const [showSkillCooldown, setShowSkillCooldown] = useState(false);
  const [isHitFlash, setIsHitFlash] = useState(false);

  const [bossActive, setBossActive] = useState(false);
  const [bossHp, setBossHp] = useState(12);
  const [bossMaxHp, setBossMaxHp] = useState(12);
  const [bossDefeated, setBossDefeated] = useState(false);
  const [enemiesDefeated, setEnemiesDefeated] = useState(0);

  // References to keep loop speed extremely fast without trigger renders
  const stateRef = useRef({
    score: 0,
    lives: 5,
    gameState: "playing",
    enemiesDefeatedCount: 0,
    player: {
      x: 0,
      y: 0,
      z: 5,
      vx: 0,
      vy: 0,
      vz: 0,
      isGrounded: true,
      facingLeft: false,
      isInvulnerable: 0, // frame countdown
      currentAction: "idle" as "idle" | "walk" | "attack" | "dance",
      currentFrame: 0,
      animTimer: 0,
      skillCooldown: 0,
    },
    keys: {
      left: false,
      right: false,
      forward: false,
      backward: false,
      jump: false,
      attack: false,
      dance: false,
    }
  });

  const togglePause = () => {
    sound.playClick();
    if (gameState === "playing") {
      setGameState("paused");
      stateRef.current.gameState = "paused";
      sound.stopMusic();
    } else if (gameState === "paused") {
      setGameState("playing");
      stateRef.current.gameState = "playing";
      sound.startMusic();
    }
  };

  const handleRestart = () => {
    sound.playClick();
    // Reset state values
    setScore(0);
    setLives(5);
    setCollectiblesCollected({ mask: 0, bell: 0, rice: 0 });
    setGameState("playing");
    setShowSkillCooldown(false);

    stateRef.current.score = 0;
    stateRef.current.lives = 5;
    stateRef.current.gameState = "playing";
    stateRef.current.player = {
      x: 0,
      y: 0,
      z: 10, // Start away from the gate
      vx: 0,
      vy: 0,
      vz: 0,
      isGrounded: true,
      facingLeft: false,
      isInvulnerable: 0,
      currentAction: "idle",
      currentFrame: 0,
      animTimer: 0,
      skillCooldown: 0,
    };

    // Re-trigger game load via state reset
    window.dispatchEvent(new CustomEvent("dansai-game-restart"));
    sound.startMusic();
  };

  useEffect(() => {
    sound.startMusic();
    return () => {
      sound.stopMusic();
    };
  }, []);

  // ThreeJS Engine Mounting and Frame Loop
  useEffect(() => {
    if (!mountRef.current) return;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0518, 0.045);

    // 2. CAMERA SETUP
    const camera = new THREE.PerspectiveCamera(55, 16 / 9, 0.1, 100);
    camera.position.set(0, 6, 15);

    // 3. RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0518);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear previous elements
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    // 4. TEXTURE LOADERS
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");

    // Ground plane 50 with texture (small tiling)
    const groundTexture = textureLoader.load(
      "https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440017/ground_yugo9h.png",
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(16, 16); // tiling เล็กหน่อย
      }
    );

    const playerTexture = textureLoader.load(
      "https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440018/player_mask_srkmbt.png",
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(0.25, 0.25);
        tex.magFilter = THREE.NearestFilter; // Sharp pixelated texture look
      }
    );

    // Load energy item texture requested by user
    const itemEnergyTexture = textureLoader.load(
      "https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440016/item_sy6anr.png"
    );
    const itemEnergyGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const itemEnergyMat = new THREE.MeshBasicMaterial({
      map: itemEnergyTexture,
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    });

    interface FallingItem3D {
      id: number;
      x: number;
      y: number;
      z: number;
      vy: number;
      mesh: THREE.Mesh;
      light: THREE.PointLight;
      collected: boolean;
      spawnTime: number;
    }
    const fallingItems: FallingItem3D[] = [];
    let lastItemSpawnTime = performance.now();
    let itemSpawnCounter = 0;

    // 5. GROUND CREATION
    const groundGeo = new THREE.PlaneGeometry(50, 50);
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 0.85,
      metalness: 0.1,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // 6. DECORATIVE ASSETS (Fences & Trees on Boundaries)
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Create custom low-poly Thai style trees and boundary lanterns
    const createBoundaryAssets = () => {
      // Small boundary pillars
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 24.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const pillarGroup = new THREE.Group();
        pillarGroup.position.set(x, 0, z);

        // Stone pillar base
        const baseGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 6);
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.9 });
        const baseMesh = new THREE.Mesh(baseGeo, stoneMat);
        baseMesh.position.y = 0.6;
        baseMesh.castShadow = true;
        pillarGroup.add(baseMesh);

        // Glowing red/gold lantern cap (Phi Ta Khon Theme)
        const capGeo = new THREE.ConeGeometry(0.35, 0.6, 6);
        const lanternMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: i % 2 === 0 ? 0xef4444 : 0xeab308,
          emissiveIntensity: 0.4,
        });
        const capMesh = new THREE.Mesh(capGeo, lanternMat);
        capMesh.position.y = 1.4;
        pillarGroup.add(capMesh);

        // Add a soft boundary point light
        if (i % 4 === 0) {
          const boundLight = new THREE.PointLight(i % 2 === 0 ? 0xef4444 : 0xeab308, 1.2, 5);
          boundLight.position.set(0, 1.4, 0);
          pillarGroup.add(boundLight);
        }

        worldGroup.add(pillarGroup);
      }

      // Add a few scattered forest trees
      for (let j = 0; j < 12; j++) {
        const tX = (Math.random() - 0.5) * 40;
        const tZ = (Math.random() - 0.5) * 40;

        // Don't spawn near center path or gate
        if (Math.abs(tX) < 4 && tZ < -15) continue;
        if (Math.sqrt(tX * tX + tZ * tZ) < 6) continue;

        const treeGroup = new THREE.Group();
        treeGroup.position.set(tX, 0, tZ);

        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 5);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        const leavesGeo = new THREE.ConeGeometry(1.2, 2.5, 5);
        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.8 });
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.y = 2.8;
        leaves.castShadow = true;
        treeGroup.add(leaves);

        worldGroup.add(treeGroup);
      }
    };
    createBoundaryAssets();

    // 6.5 SPATIAL RANDOM GRASS PROP GENERATION (ต้นหญ้าตามพื้น)
    const grasses: GrassProp3D[] = [];
    const grassTexture = textureLoader.load(
      "https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440015/grass_2_kzrnxt.png",
      (tex) => {
        tex.magFilter = THREE.NearestFilter;
      }
    );

    const grassGeo = new THREE.PlaneGeometry(1.0, 1.0);
    const grassMat = new THREE.MeshStandardMaterial({
      map: grassTexture,
      transparent: true,
      alphaTest: 0.2,
      side: THREE.DoubleSide,
      roughness: 0.9,
    });

    const createGrassAssets = () => {
      // Spawn 50 grasses randomly on the ground
      for (let i = 0; i < 50; i++) {
        const gX = (Math.random() - 0.5) * 44;
        const gZ = (Math.random() - 0.5) * 44;

        // Don't spawn too close to start, or gate, or right under static thorn obstacles
        if (Math.abs(gX) < 3.5 && gZ < -14) continue;
        if (Math.sqrt(gX * gX + gZ * gZ) < 5) continue;

        const baseHeight = 0.6 + Math.random() * 0.5; // height: 0.6 to 1.1
        const baseWidth = 0.7 + Math.random() * 0.5;  // width: 0.7 to 1.2

        const mesh = new THREE.Mesh(grassGeo, grassMat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.scale.set(baseWidth, baseHeight, 1.0);
        mesh.position.set(gX, baseHeight / 2, gZ);
        scene.add(mesh);

        grasses.push({
          id: i,
          startX: gX,
          startZ: gZ,
          mesh: mesh,
          targetScaleY: baseHeight,
          currentScaleY: baseHeight,
          baseHeight,
          baseWidth,
        });
      }
    };
    createGrassAssets();

    // 7. LIGHTS
    const ambientLight = new THREE.AmbientLight(0x1a1a3a, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x818cf8, 1.5);
    dirLight.position.set(10, 20, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Dynamic Player Spotlight/Aura to illuminate ground
    const playerLight = new THREE.PointLight(0xe11d48, 2.5, 9);
    playerLight.castShadow = true;
    scene.add(playerLight);

    // 8. PLAYER CREATION (2D Facing Camera Billboard Mesh)
    const playerGeo = new THREE.PlaneGeometry(2.0, 2.0);
    const playerMat = new THREE.MeshBasicMaterial({
      map: playerTexture,
      transparent: true,
      alphaTest: 0.2,
      side: THREE.DoubleSide,
    });
    const playerMesh = new THREE.Mesh(playerGeo, playerMat);
    playerMesh.position.set(0, 1.8, 5); // Start slightly forward
    playerMesh.castShadow = true;
    scene.add(playerMesh);

    // 9. THE SPECTACULAR WAT NERAMIT GATE (GOAL GATE)
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, -22); // Target Goal position

    // Left and Right Red columns
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5, metalness: 0.3 });
    const colGeo = new THREE.BoxGeometry(0.6, 4.2, 0.6);
    
    const leftCol = new THREE.Mesh(colGeo, pillarMat);
    leftCol.position.set(-3.2, 2.1, 0);
    leftCol.castShadow = true;
    gateGroup.add(leftCol);

    const rightCol = new THREE.Mesh(colGeo, pillarMat);
    rightCol.position.set(3.2, 2.1, 0);
    rightCol.castShadow = true;
    gateGroup.add(rightCol);

    // Golden decorative rings
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });
    const ringGeo = new THREE.BoxGeometry(0.7, 0.2, 0.7);
    for (let rY = 0.5; rY < 4.0; rY += 1.2) {
      const leftRing = new THREE.Mesh(ringGeo, goldMat);
      leftRing.position.set(-3.2, rY, 0);
      gateGroup.add(leftRing);

      const rightRing = new THREE.Mesh(ringGeo, goldMat);
      rightRing.position.set(3.2, rY, 0);
      gateGroup.add(rightRing);
    }

    // Tiered golden roof structure (Traditional Thai design)
    const roof1 = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.4, 1.0), pillarMat);
    roof1.position.set(0, 4.3, 0);
    gateGroup.add(roof1);

    const roof2 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.4, 0.8), goldMat);
    roof2.position.set(0, 4.7, 0);
    gateGroup.add(roof2);

    const roofSpire = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.5, 6), goldMat);
    roofSpire.position.set(0, 5.6, 0);
    gateGroup.add(roofSpire);

    // Glowing holy circular Portal
    const portalGeo = new THREE.TorusGeometry(2.0, 0.12, 16, 64);
    const portalMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      emissive: 0xeab308,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.9,
    });
    const portalMesh = new THREE.Mesh(portalGeo, portalMat);
    portalMesh.position.set(0, 2.0, 0);
    portalMesh.visible = false; // Initially inactive until Boss is defeated
    gateGroup.add(portalMesh);

    const portalFillGeo = new THREE.CylinderGeometry(1.9, 1.9, 0.05, 32);
    const portalFillMat = new THREE.MeshBasicMaterial({
      color: 0xeab308,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const portalFill = new THREE.Mesh(portalFillGeo, portalFillMat);
    portalFill.rotation.x = Math.PI / 2;
    portalFill.position.set(0, 2.0, 0);
    portalFill.visible = false; // Initially inactive until Boss is defeated
    gateGroup.add(portalFill);

    // Epic golden light inside portal
    const gateLight = new THREE.PointLight(0xeab308, 4, 12);
    gateLight.position.set(0, 2.0, 0.2);
    gateLight.visible = false; // Initially inactive until Boss is defeated
    gateGroup.add(gateLight);

    scene.add(gateGroup);

    // 9.5 BOSS DEFEAT SPATIAL STATE SETUP
    const boss = {
      active: false,
      spawned: false,
      defeated: false,
      hp: 12,
      maxHp: 12,
      mesh: null as THREE.Group | null,
      texture: null as THREE.Texture | null,
      material: null as THREE.MeshStandardMaterial | null,
      x: 0,
      y: 4.0,
      z: -12,
      targetX: 0,
      targetY: 4.0,
      targetZ: -12,
      moveTimer: 0,
      animTimer: 0,
      currentFrame: 0,
      currentRow: 0,
      flashColor: "none" as "none" | "red" | "white",
      flashTimer: 0,
      shootCooldown: 2500, // starts shooting soon
      patternState: "idle" as "idle" | "dash_prep" | "dash" | "attack_prep" | "attack",
      patternTimer: 2000,
      pulseTimer: 0,
    };

    const npc = {
      spawned: false,
      mesh: null as THREE.Group | null,
      texture: null as THREE.Texture | null,
      material: null as THREE.MeshStandardMaterial | null,
      x: 0,
      y: 1.0,
      z: -26,
      targetZ: -19.5,
      animTimer: 0,
      currentFrame: 0,
      currentRow: 0,
    };

    const npcTexture = textureLoader.load(
      "https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440017/npc1_kgr83q.png",
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(0.25, 0.5); // 4 columns, 2 rows
        tex.magFilter = THREE.NearestFilter;
      }
    );

    const bossTexture = textureLoader.load(
      "https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440016/boss_du7pfp.png",
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(0.5, 0.5); // 2 columns, 2 rows
        tex.magFilter = THREE.NearestFilter;
      }
    );

    interface BossBullet3D {
      mesh: THREE.Mesh;
      targetX: number;
      targetZ: number;
      currentY: number;
      speedY: number;
      warningCircle: THREE.Mesh;
      isFalling: boolean;
      lifetime: number;
    }
    const bossBullets: BossBullet3D[] = [];

    // 10. SPAWN 12 COLLECTIBLES
    const collectibles: Collectible3D[] = [];
    const collectGroup = new THREE.Group();
    scene.add(collectGroup);

    const collectDefs = [
      // 4 Masks (Red)
      { type: "mask" as const, x: -8, z: 8 },
      { type: "mask" as const, x: 8, z: -8 },
      { type: "mask" as const, x: 12, z: 12 },
      { type: "mask" as const, x: -14, z: -10 },
      // 4 Bells (Gold)
      { type: "bell" as const, x: 15, z: 2 },
      { type: "bell" as const, x: -15, z: 2 },
      { type: "bell" as const, x: 5, z: 16 },
      { type: "bell" as const, x: -5, z: -16 },
      // 4 Sticky Rice (Green)
      { type: "rice" as const, x: 10, z: -18 },
      { type: "rice" as const, x: -10, z: 18 },
      { type: "rice" as const, x: -18, z: -2 },
      { type: "rice" as const, x: 18, z: -12 },
    ];

    collectDefs.forEach((def, index) => {
      const g = new THREE.Group();
      g.position.set(def.x, 0.5, def.z);

      let itemLight: THREE.PointLight | undefined;

      // Outer gold glowing halo ring at bottom
      const ringGeo = new THREE.RingGeometry(0.45, 0.55, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: def.type === "mask" ? 0xef4444 : def.type === "bell" ? 0xfacc15 : 0x22c55e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -0.45;
      g.add(ring);

      if (def.type === "mask") {
        // Red glowing octahedron representing the sacred mask
        const geo = new THREE.OctahedronGeometry(0.38);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xef4444,
          emissiveIntensity: 0.6,
          metalness: 0.8,
          roughness: 0.1,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        g.add(mesh);

        itemLight = new THREE.PointLight(0xef4444, 2, 4);
      } else if (def.type === "bell") {
        // Gold glowing Torus representing holy bell
        const geo = new THREE.TorusGeometry(0.28, 0.1, 8, 16);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0xfacc15,
          emissiveIntensity: 0.5,
          metalness: 0.9,
          roughness: 0.1,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        g.add(mesh);

        itemLight = new THREE.PointLight(0xfacc15, 2, 4);
      } else {
        // Green bamboo container for sticky rice (Kratip)
        const geo = new THREE.CylinderGeometry(0.28, 0.28, 0.5, 8);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x22c55e,
          emissive: 0x22c55e,
          emissiveIntensity: 0.4,
          roughness: 0.6,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        g.add(mesh);

        // Yellow bamboo lid band
        const lidGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.12, 8);
        const lidMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
        const lid = new THREE.Mesh(lidGeo, lidMat);
        lid.position.y = 0.28;
        g.add(lid);

        itemLight = new THREE.PointLight(0x22c55e, 2, 4);
      }

      if (itemLight) {
        itemLight.position.set(0, 0, 0);
        g.add(itemLight);
      }

      collectGroup.add(g);
      collectibles.push({
        id: index,
        type: def.type,
        startX: def.x,
        startZ: def.z,
        mesh: g,
        collected: false,
        light: itemLight,
      });
    });

    // 11. SPAWN PATROL SPIRITS (ผีป่วน)
    const enemies: SpiritEnemy3D[] = [];
    const enemyGroup = new THREE.Group();
    scene.add(enemyGroup);

    const enemyDefs = [
      { startX: -6, startZ: 2, range: 4.5, speed: 1.2, pattern: "line" as const },
      { startX: 6, startZ: -6, range: 5.5, speed: 1.5, pattern: "circle" as const },
      { startX: -12, startZ: -12, range: 4, speed: 1.0, pattern: "line" as const },
      { startX: 12, startZ: 10, range: 5, speed: 1.3, pattern: "circle" as const },
      { startX: 0, startZ: -14, range: 6, speed: 1.6, pattern: "line" as const },
    ];

    const enemyBaseTexture = textureLoader.load(
      "https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440015/enemy2_ftd6hv.png",
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(0.25, 0.5);
        tex.magFilter = THREE.NearestFilter;
      }
    );

    let enemyIdCounter = enemyDefs.length;
    const spawnEnemy = (startX: number, startZ: number, speed = 1.2, range = 4.5, pattern: "line" | "circle" = "line") => {
      const g = new THREE.Group();
      g.position.set(startX, 1.6, startZ);

      // Clone texture so each enemy has its own offset state
      const enemyTex = enemyBaseTexture.clone();
      enemyTex.repeat.set(0.25, 0.5);
      enemyTex.needsUpdate = true;

      const enemyMat = new THREE.MeshStandardMaterial({
        map: enemyTex,
        transparent: true,
        alphaTest: 0.2,
        side: THREE.DoubleSide,
        roughness: 0.6,
        metalness: 0.1,
      });

      const enemyPlaneGeo = new THREE.PlaneGeometry(1.8, 1.8);
      const enemyPlaneMesh = new THREE.Mesh(enemyPlaneGeo, enemyMat);
      enemyPlaneMesh.castShadow = true;
      g.add(enemyPlaneMesh);

      // Spooky red point light
      const spiritLight = new THREE.PointLight(0xef4444, 2.5, 5);
      spiritLight.position.set(0, 0.5, 0);
      g.add(spiritLight);

      enemyGroup.add(g);
      enemies.push({
        id: enemyIdCounter++,
        startX,
        startZ,
        speed,
        range,
        angle: Math.random() * Math.PI * 2,
        pattern,
        mesh: g,
        light: spiritLight,
        hp: 2,
        isKnockedBack: false,
        knockbackX: 0,
        knockbackZ: 0,
        knockbackTimer: 0,
        isDead: false,
        deadVelocityX: 0,
        deadVelocityY: 0,
        deadVelocityZ: 0,
        deadTimer: 0,
        flashColor: "none",
        attackCooldown: 0,
        isAttacking: false,
        attackTimer: 0,
        currentFrame: 0,
        animTimer: 0,
        currentRow: 0,
      });
    };

    enemyDefs.forEach((def) => {
      spawnEnemy(def.startX, def.startZ, def.speed, def.range, def.pattern);
    });

    // 12. SPAWN SPIKY THORNS (หนามสยอง)
    const thorns: ThornObstacle3D[] = [];
    const thornGroup = new THREE.Group();
    scene.add(thornGroup);

    const thornPositions = [
      { x: -3, z: -8 }, { x: 3, z: -8 },
      { x: -12, z: 6 }, { x: 14, z: -4 },
      { x: 5, z: -14 }, { x: -16, z: -15 },
      { x: 18, z: 15 }, { x: -1, z: 12 }
    ];

    thornPositions.forEach((pos) => {
      const g = new THREE.Group();
      g.position.set(pos.x, 0, pos.z);

      // A cluster of 3 pointy spiky cones
      const tMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xe11d48,
        emissiveIntensity: 0.3,
        roughness: 0.1,
      });

      const coneGeo1 = new THREE.ConeGeometry(0.24, 0.8, 4);
      const cone1 = new THREE.Mesh(coneGeo1, tMat);
      cone1.position.set(0, 0.4, 0);
      cone1.castShadow = true;
      g.add(cone1);

      const coneGeo2 = new THREE.ConeGeometry(0.18, 0.6, 4);
      const cone2 = new THREE.Mesh(coneGeo2, tMat);
      cone2.position.set(-0.25, 0.3, 0.15);
      cone2.rotation.z = 0.2;
      cone2.castShadow = true;
      g.add(cone2);

      const cone3 = new THREE.Mesh(coneGeo2, tMat);
      cone3.position.set(0.25, 0.3, -0.15);
      cone3.rotation.z = -0.2;
      cone3.castShadow = true;
      g.add(cone3);

      thornGroup.add(g);
      thorns.push({
        x: pos.x,
        z: pos.z,
        mesh: cone1, // For reference
      });
    });

    // 13. PROCEDURAL SKILL & ATTACK PARTICLE SYSTEM
    const activeParticles: Particle3D[] = [];

    const spawnImpactParticle = (x: number, y: number, z: number, color: number, count = 12) => {
      for (let i = 0; i < count; i++) {
        const geo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const mat = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 1,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
          x + (Math.random() - 0.5) * 0.5,
          y + (Math.random() - 0.5) * 0.5,
          z + (Math.random() - 0.5) * 0.5
        );
        scene.add(mesh);

        const angle = Math.random() * Math.PI * 2;
        const radialSpeed = 0.05 + Math.random() * 0.08;
        const velocity = new THREE.Vector3(
          Math.cos(angle) * radialSpeed,
          0.04 + Math.random() * 0.08,
          Math.sin(angle) * radialSpeed
        );

        activeParticles.push({
          mesh,
          velocity,
          life: 0,
          maxLife: 20 + Math.floor(Math.random() * 15),
        });
      }
    };

    const spawnSkillBurstParticles = (px: number, py: number, pz: number) => {
      // Massive splash ring
      for (let r = 0; r < 36; r++) {
        const angle = (r / 36) * Math.PI * 2;
        const geo = new THREE.SphereGeometry(0.08 + Math.random() * 0.06, 8, 8);
        
        // Rainbow colors matching Thai traditional ribbons (Red, Gold, Green, Pink)
        const colors = [0xef4444, 0xeab308, 0x10b981, 0xec4899];
        const color = colors[r % colors.length];

        const mat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 1,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(px, py + 0.1, pz);
        scene.add(mesh);

        const velocity = new THREE.Vector3(
          Math.cos(angle) * 0.15,
          0.02 + Math.random() * 0.05,
          Math.sin(angle) * 0.15
        );

        activeParticles.push({
          mesh,
          velocity,
          life: 0,
          maxLife: 35 + Math.floor(Math.random() * 15),
        });
      }
    };

    // 14. KEY INPUT BINDERS
    const keys = stateRef.current.keys;
    const keybindings = settings.keybindings;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }

      const matchKey = (boundKey: string) => {
        if (boundKey === "Space" && e.code === "Space") return true;
        if (e.code === boundKey) return true;
        if (e.key === boundKey) return true;
        return false;
      };

      // Support custom keybindings as well as standard WASD & Arrows natively!
      if (matchKey(keybindings.moveLeft) || e.code === "KeyA" || e.code === "ArrowLeft") keys.left = true;
      if (matchKey(keybindings.moveRight) || e.code === "KeyD" || e.code === "ArrowRight") keys.right = true;
      if (e.code === "KeyW" || e.code === "ArrowUp") keys.forward = true;
      if (e.code === "KeyS" || e.code === "ArrowDown") keys.backward = true;
      if (matchKey(keybindings.jump) || e.code === "Space") keys.jump = true;
      if (matchKey(keybindings.interact) || e.code === "KeyP") keys.attack = true;
      if (e.code === "KeyO") keys.dance = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const matchKey = (boundKey: string) => {
        if (boundKey === "Space" && e.code === "Space") return true;
        if (e.code === boundKey) return true;
        if (e.key === boundKey) return true;
        return false;
      };

      if (matchKey(keybindings.moveLeft) || e.code === "KeyA" || e.code === "ArrowLeft") keys.left = false;
      if (matchKey(keybindings.moveRight) || e.code === "KeyD" || e.code === "ArrowRight") keys.right = false;
      if (e.code === "KeyW" || e.code === "ArrowUp") keys.forward = false;
      if (e.code === "KeyS" || e.code === "ArrowDown") keys.backward = false;
      if (matchKey(keybindings.jump) || e.code === "Space") keys.jump = false;
      if (matchKey(keybindings.interact) || e.code === "KeyP") keys.attack = false;
      if (e.code === "KeyO") keys.dance = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Dynamic reset listener
    const handleResetEvent = () => {
      const s = stateRef.current;
      playerMesh.position.set(0, 1.8, 10);
      playerMesh.scale.set(1.8, 1.8, 1.8);
      // Reset all items
      collectibles.forEach((item) => {
        item.collected = false;
        item.mesh.visible = true;
        if (item.light) item.light.visible = true;
      });
      // Clear falling energy items from the scene
      fallingItems.forEach((item) => {
        scene.remove(item.mesh);
      });
      fallingItems.length = 0;
      lastItemSpawnTime = performance.now();
      // Purge old particles
      activeParticles.forEach((p) => {
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        if (Array.isArray(p.mesh.material)) {
          p.mesh.material.forEach((mat) => mat.dispose());
        } else {
          p.mesh.material.dispose();
        }
      });
      activeParticles.length = 0;

      // Reset all enemies
      enemies.forEach((ghost) => {
        ghost.hp = 2;
        ghost.isDead = false;
        ghost.isKnockedBack = false;
        ghost.knockbackX = 0;
        ghost.knockbackZ = 0;
        ghost.knockbackTimer = 0;
        ghost.deadVelocityX = 0;
        ghost.deadVelocityY = 0;
        ghost.deadVelocityZ = 0;
        ghost.deadTimer = 0;
        ghost.flashColor = "none";
        ghost.attackCooldown = 0;
        ghost.isAttacking = false;
        ghost.attackTimer = 0;
        ghost.currentFrame = 0;
        ghost.animTimer = 0;
        ghost.currentRow = 0;
        ghost.mesh.position.set(ghost.startX, 1.6, ghost.startZ);
        ghost.mesh.rotation.set(0, 0, 0);
        ghost.mesh.scale.set(1.8, 1.8, 1.8);
        ghost.mesh.visible = true;

        if (!enemyGroup.children.includes(ghost.mesh)) {
          enemyGroup.add(ghost.mesh);
        }

        const mat = (ghost.mesh.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.color.setHex(0xffffff);
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0.0;
        }
      });

      // Reset all grasses
      grasses.forEach((grass) => {
        grass.targetScaleY = grass.baseHeight;
        grass.currentScaleY = grass.baseHeight;
        grass.mesh.scale.set(grass.baseWidth, grass.baseHeight, 1.0);
        grass.mesh.position.y = grass.baseHeight / 2;
      });

      // Reset Boss
      if (boss.mesh) {
        scene.remove(boss.mesh);
        boss.mesh = null;
      }
      boss.active = false;
      boss.spawned = false;
      boss.defeated = false;
      boss.hp = 12;
      boss.maxHp = 12;
      boss.currentRow = 0;
      boss.currentFrame = 0;
      boss.flashColor = "none";
      boss.flashTimer = 0;
      boss.shootCooldown = 2500;
      boss.patternState = "idle";
      boss.patternTimer = 2000;
      boss.pulseTimer = 0;

      // Reset NPC
      if (npc.mesh) {
        scene.remove(npc.mesh);
        npc.mesh = null;
      }
      npc.spawned = false;
      npc.currentRow = 0;
      npc.currentFrame = 0;
      setDialogueIndex(0);
      setShowDialogue(false);

      setBossActive(false);
      setBossHp(12);
      setBossDefeated(false);
      setEnemiesDefeated(0);
      s.enemiesDefeatedCount = 0;

      // Hide portal again
      portalMesh.visible = false;
      portalFill.visible = false;
      gateLight.visible = false;

      // Clean up any stray boss bullets or warning circles
      bossBullets.forEach((b) => {
        scene.remove(b.mesh);
        scene.remove(b.warningCircle);
      });
      bossBullets.length = 0;
    };
    window.addEventListener("dansai-game-restart", handleResetEvent);

    // 15. RESIZING OBSERVER
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(mountRef.current);
    handleResize();

    // DAMAGE PLAYER HELPER
    const damagePlayer = (srcX: number, srcZ: number) => {
      const s = stateRef.current;
      const player = s.player;
      if (player.isInvulnerable > 0 || s.gameState !== "playing") return;

      player.isInvulnerable = 55; // invulnerability frames countdown
      sound.playHit();

      // Recoil knockback away from damage source
      const angle = Math.atan2(player.z - srcZ, player.x - srcX);
      player.vx = Math.cos(angle) * 0.35;
      player.vz = Math.sin(angle) * 0.35;
      player.vy = 1.0;
      player.isGrounded = false;

      // Trigger screen red Hit Flash
      setIsHitFlash(true);
      setTimeout(() => setIsHitFlash(false), 200);

      // Explosion spark particles
      spawnImpactParticle(player.x, player.y, player.z, 0xef4444, 15);

      // Lives deduction
      s.lives -= 1;
      setLives(s.lives);

      if (s.lives <= 0) {
        setGameState("gameover");
        s.gameState = "gameover";
        sound.stopMusic();
        sound.playGameOver();
      }
    };

    // SPAWN BOSS HELPER
    const spawnBoss = () => {
      boss.spawned = true;
      boss.active = true;
      boss.hp = 12;
      boss.maxHp = 12;

      setBossActive(true);
      setBossHp(12);
      setBossMaxHp(12);

      const g = new THREE.Group();
      g.position.set(0, 4.0, -12); // Floating upper-middle arena

      const bossMat = new THREE.MeshStandardMaterial({
        map: bossTexture,
        transparent: true,
        alphaTest: 0.2,
        side: THREE.DoubleSide,
        roughness: 0.5,
        metalness: 0.2,
      });

      const bossGeo = new THREE.PlaneGeometry(4.5, 4.5);
      const bossMeshObj = new THREE.Mesh(bossGeo, bossMat);
      bossMeshObj.castShadow = true;
      bossMeshObj.receiveShadow = true;
      g.add(bossMeshObj);

      const bossLight = new THREE.PointLight(0xa855f7, 5, 12);
      bossLight.position.set(0, 1.0, 0);
      g.add(bossLight);

      scene.add(g);
      boss.mesh = g;
      boss.material = bossMat;

      // Epic entrance explosion particles
      spawnImpactParticle(0, 4.0, -12, 0xa855f7, 50);
      spawnImpactParticle(0, 4.0, -12, 0xef4444, 50);

      // Scream sound / skill burst sound
      sound.playSkill();
    };

    // TRIGGER BOSS SHOOT HELPER
    const triggerBossShoot = () => {
      const s = stateRef.current;
      const player = s.player;
      if (!boss.mesh || s.gameState !== "playing" || boss.defeated) return;

      boss.currentRow = 1; // Animation row: shooting (1)
      setTimeout(() => {
        if (!boss.defeated) boss.currentRow = 0;
      }, 900);

      // Play fiery bullet whoosh sound
      sound.playSkill();

      // Launch 3 meteor bullets
      for (let i = 0; i < 3; i++) {
        // Target is around player with a small random dispersion
        const targetX = player.x + (Math.random() - 0.5) * 6.5;
        const targetZ = player.z + (Math.random() - 0.5) * 6.5;

        // Clamp targets inside map boundaries
        const clampedX = Math.max(-21, Math.min(21, targetX));
        const clampedZ = Math.max(-21, Math.min(21, targetZ));

        // Create Warning Decal Ring on ground
        const warningGeo = new THREE.RingGeometry(0.01, 0.9, 16);
        const warningMat = new THREE.MeshBasicMaterial({
          color: 0xef4444,
          transparent: true,
          opacity: 0.65,
          side: THREE.DoubleSide
        });
        const warningCircle = new THREE.Mesh(warningGeo, warningMat);
        warningCircle.rotation.x = -Math.PI / 2;
        warningCircle.position.set(clampedX, 0.05, clampedZ);
        scene.add(warningCircle);

        // Create Projectile Sphere Mesh
        const bulletGeo = new THREE.SphereGeometry(0.38, 12, 12);
        const bulletMat = new THREE.MeshStandardMaterial({
          color: 0xff4500,
          emissive: 0xffaa00,
          emissiveIntensity: 1.5,
          roughness: 0.1,
        });
        const bulletMesh = new THREE.Mesh(bulletGeo, bulletMat);
        
        // Starts at the Boss's position, flying up first
        bulletMesh.position.set(boss.x, boss.y + 0.5, boss.z);
        scene.add(bulletMesh);

        // Add small orange glow light
        const bulletLight = new THREE.PointLight(0xef4444, 2, 4);
        bulletMesh.add(bulletLight);

        bossBullets.push({
          mesh: bulletMesh,
          targetX: clampedX,
          targetZ: clampedZ,
          currentY: boss.y + 0.5,
          speedY: 0.25, // positive upward velocity first
          warningCircle,
          isFalling: false,
          lifetime: 0,
        });
      }
    };

    // SPAWN NPC HELPER
    const spawnNPC = () => {
      npc.spawned = true;
      npc.x = 0;
      npc.y = 1.0;
      npc.z = -26; // inside/behind the portal gateway
      npc.targetZ = -19.5; // stops in front of the portal facing player

      const g = new THREE.Group();
      g.position.set(npc.x, npc.y, npc.z);

      const npcMat = new THREE.MeshStandardMaterial({
        map: npcTexture,
        transparent: true,
        alphaTest: 0.2,
        side: THREE.DoubleSide,
        roughness: 0.6,
        metalness: 0.1,
      });

      const npcGeo = new THREE.PlaneGeometry(1.8, 1.8);
      const npcMeshObj = new THREE.Mesh(npcGeo, npcMat);
      npcMeshObj.castShadow = true;
      g.add(npcMeshObj);

      // Warm glow green point light
      const npcLight = new THREE.PointLight(0x22c55e, 2, 6);
      npcLight.position.set(0, 0.5, 0);
      g.add(npcLight);

      scene.add(g);
      npc.mesh = g;
      npc.material = npcMat;

      // Magical green entrance sparkles
      spawnImpactParticle(npc.x, npc.y, npc.z, 0x22c55e, 35);
    };

    // 16. THE EPIC 60FPS THREEJS RENDERING GAME LOOP
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = 0;
    let randomEnemySpawnTimer = 1000 + Math.random() * 2000; // random 1-3 seconds

    const gameLoop = (timestamp: number) => {
      const dt = timestamp - lastTime;
      lastTime = timestamp;

      // Track FPS
      frameCount++;
      fpsTimer += dt;
      if (fpsTimer >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        fpsTimer = 0;
      }

      const s = stateRef.current;
      const player = s.player;

      // ONLY PROCESS GAMEPLAY LOGIC IF PLAYING
      if (s.gameState === "playing") {
        
        // Invulnerability frame reduction
        if (player.isInvulnerable > 0) {
          player.isInvulnerable--;
        }

        // Skill cooldown reduction
        if (player.skillCooldown > 0) {
          player.skillCooldown -= dt;
          if (player.skillCooldown <= 0) {
            player.skillCooldown = 0;
            setShowSkillCooldown(false);
          }
        }

        // Tick and process random enemy spawner (every 1-3 seconds from all directions)
        randomEnemySpawnTimer -= dt;
        if (randomEnemySpawnTimer <= 0) {
          randomEnemySpawnTimer = 1000 + Math.random() * 2000; // Reset to 1-3 seconds
          
          // Spawn enemy from a random direction around the player
          const angle = Math.random() * Math.PI * 2;
          const dist = 18.0 + Math.random() * 6.0; // spawn at a distance of 18-24 units
          let sX = player.x + Math.cos(angle) * dist;
          let sZ = player.z + Math.sin(angle) * dist;
          
          // Clamp spawn coordinates inside the 50x50 arena map boundaries
          sX = Math.max(-23, Math.min(23, sX));
          sZ = Math.max(-23, Math.min(23, sZ));

          // Set random ghost speed and movement pattern
          const speed = 0.9 + Math.random() * 0.7;
          spawnEnemy(sX, sZ, speed, 5, Math.random() > 0.5 ? "line" : "circle");
        }

        // DECIDE PLAYER ACTION STATE
        if (keys.attack && player.currentAction !== "attack") {
          // Trigger attack (Row 3, index 2)
          player.currentAction = "attack";
          player.currentFrame = 0;
          player.animTimer = 0;
          sound.playAttack();
          // Spawn swift attack sparks in front of the player
          const lookDir = player.facingLeft ? -1.2 : 1.2;
          spawnImpactParticle(player.x + lookDir, player.y + 0.3, player.z, 0xef4444, 8);

          // Hit detection on Boss
          if (boss.active && !boss.defeated && boss.mesh) {
            const bdx = boss.x - player.x;
            const bdz = boss.z - player.z;
            const bdist = Math.sqrt(bdx * bdx + bdz * bdz);

            if (bdist < 3.2 && Math.abs(player.y - boss.y) < 3.0) {
              const facingCorrect = player.facingLeft ? (bdx < 0.4) : (bdx > -0.4);
              if (facingCorrect) {
                boss.hp -= 1;
                setBossHp(boss.hp);
                sound.playHit();

                // Sparkles on Boss
                spawnImpactParticle(boss.x, boss.y, boss.z, 0xfacc15, 20);

                // Flash white
                boss.flashColor = "white";
                boss.flashTimer = 15;

                if (boss.mesh) {
                  boss.mesh.scale.setScalar(1.25);
                  setTimeout(() => {
                    if (boss.mesh && !boss.defeated) {
                      boss.mesh.scale.setScalar(1.0);
                    }
                  }, 150);
                }

                if (boss.hp <= 0) {
                  // Boss defeated!
                  boss.defeated = true;
                  boss.active = false;
                  setBossDefeated(true);
                  setBossActive(false);

                  // Big explosion
                  spawnImpactParticle(boss.x, boss.y, boss.z, 0xeab308, 40);
                  spawnImpactParticle(boss.x, boss.y, boss.z, 0xef4444, 40);
                  spawnImpactParticle(boss.x, boss.y, boss.z, 0x3b82f6, 40);

                  if (boss.mesh) {
                    scene.remove(boss.mesh);
                  }

                  s.score += 5000;
                  setScore(s.score);

                  // ACTIVATE THE WARP PORTAL!
                  portalMesh.visible = true;
                  portalFill.visible = true;
                  gateLight.visible = true;

                  sound.playSkill();
                  spawnImpactParticle(0, 2.0, -22, 0xeab308, 50);
                }
              }
            }
          }

          // Hit detection on enemies
          enemies.forEach((ghost) => {
            if (ghost.isDead) return;

            const gdx = ghost.mesh.position.x - player.x;
            const gdz = ghost.mesh.position.z - player.z;
            const gdist = Math.sqrt(gdx * gdx + gdz * gdz);

            // Close enough and vertically aligned
            if (gdist < 2.5 && Math.abs(player.y - ghost.mesh.position.y) < 1.8) {
              const inDirection = player.facingLeft ? (gdx < 0.3) : (gdx > -0.3);
              if (inDirection) {
                // Damage enemy!
                ghost.hp -= 1;
                sound.playHit();
                
                // White damage sparks
                spawnImpactParticle(ghost.mesh.position.x, ghost.mesh.position.y + 0.2, ghost.mesh.position.z, 0xffffff, 15);
                
                if (ghost.hp === 1) {
                  // Hit 1: "ครั้งแรกให้กระเด็นไปข้างหลังทิศทางที่เดินมา"
                  // They get knocked back in the opposite direction they were travelling (or away from the player).
                  const len = gdist || 1;
                  ghost.knockbackX = (gdx / len) * 0.45;
                  ghost.knockbackZ = (gdz / len) * 0.45;
                  ghost.isKnockedBack = true;
                  ghost.knockbackTimer = 20; // 20 update frames of knockback decay
                  ghost.flashColor = "white"; // flashes white temporarily when hit
                  
                  // Visual size surge on hit
                  ghost.mesh.scale.setScalar(2.3);
                  setTimeout(() => {
                    if (ghost.mesh && !ghost.isDead) {
                      ghost.mesh.scale.setScalar(1.8);
                    }
                  }, 150);
                } else if (ghost.hp <= 0) {
                  // Hit 2: "ครั้งสองให้กระเด็นออกจากฉากไป หรือ กระพริบสีขาวรัวๆ แล้วหายไป"
                  // Rapid flashing and launch high/out of screen!
                  ghost.isDead = true;
                  ghost.flashColor = "white_rapid";
                  
                  const len = gdist || 1;
                  ghost.deadVelocityX = (gdx / len) * 0.18;
                  ghost.deadVelocityZ = (gdz / len) * 0.18;
                  ghost.deadVelocityY = 0.35; // high upward launch velocity
                  ghost.deadTimer = 0;
                  
                  // Big explosion sparks
                  spawnImpactParticle(ghost.mesh.position.x, ghost.mesh.position.y + 0.3, ghost.mesh.position.z, 0xeab308, 25);
                  
                  s.score += 500;
                  setScore(s.score);

                  s.enemiesDefeatedCount += 1;
                  setEnemiesDefeated(s.enemiesDefeatedCount);

                  if (s.enemiesDefeatedCount >= 10 && !boss.spawned) {
                    spawnBoss();
                  }
                }
              }
            }
          });
        } else if (keys.dance && player.currentAction !== "dance" && player.currentAction !== "attack") {
          // Trigger Dance & Skill (Row 4, index 3)
          if (player.skillCooldown === 0) {
            player.currentAction = "dance";
            player.currentFrame = 0;
            player.animTimer = 0;
            player.skillCooldown = 3200; // 3.2 second cooldown
            setShowSkillCooldown(true);
            sound.playSkill();
            spawnSkillBurstParticles(player.x, player.y - 0.5, player.z);
            
            // Collect any item or stagger any nearby ghost within a circular range (Magical skill!)
            collectibles.forEach((item) => {
              if (!item.collected) {
                const dx = item.startX - player.x;
                const dz = item.startZ - player.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < 4.5) {
                  // Collected magnetically!
                  item.collected = true;
                  item.mesh.visible = false;
                  if (item.light) item.light.visible = false;
                  sound.playCollect();
                  
                  // Score addition
                  const pts = item.type === "mask" ? 250 : item.type === "bell" ? 100 : 150;
                  s.score += pts;
                  setScore(s.score);
                  setCollectiblesCollected((prev) => ({
                    ...prev,
                    [item.type]: prev[item.type] + 1
                  }));
                  spawnImpactParticle(item.startX, 0.5, item.startZ, 0xffffff, 10);
                }
              }
            });

            // Also attract falling energy items!
            for (let fi = fallingItems.length - 1; fi >= 0; fi--) {
              const item = fallingItems[fi];
              if (!item.collected) {
                const dx = item.x - player.x;
                const dz = item.z - player.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < 4.5) {
                  item.collected = true;
                  sound.playCollect();
                  if (s.lives < 5) {
                    s.lives += 1;
                    setLives(s.lives);
                  }
                  s.score += 50;
                  setScore(s.score);
                  spawnImpactParticle(item.x, item.y, item.z, 0x10b981, 15);
                  scene.remove(item.mesh);
                  fallingItems.splice(fi, 1);
                }
              }
            }
          } else {
            // Just normal dance if cooldown active
            player.currentAction = "dance";
          }
        }

        // MOVEMENT LOGIC (8-directional)
        let dx = 0;
        let dz = 0;

        if (keys.left) dx -= 1;
        if (keys.right) dx += 1;
        if (keys.forward) dz -= 1;
        if (keys.backward) dz += 1;

        // Apply velocities based on actions (locks movement during attack)
        const isControlLocked = player.currentAction === "attack";
        
        if (!isControlLocked) {
          if (dx !== 0 || dz !== 0) {
            // Normalize vector to keep diagonal speed identical to lateral speed
            const len = Math.sqrt(dx * dx + dz * dz);
            const moveSpeed = 0.14; // speed parameter
            player.vx = (dx / len) * moveSpeed;
            player.vz = (dz / len) * moveSpeed;
            
            if (player.currentAction !== "dance") {
              player.currentAction = "walk";
            }

            // Direction facing
            if (dx < 0) player.facingLeft = true;
            if (dx > 0) player.facingLeft = false;

            // Spawn slight movement dust on floor
            if (player.isGrounded && Math.random() < 0.15) {
              const dustGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
              const dustMat = new THREE.MeshBasicMaterial({ color: 0x4b5563, transparent: true, opacity: 0.6 });
              const dust = new THREE.Mesh(dustGeo, dustMat);
              dust.position.set(player.x, player.y - 0.9, player.z);
              scene.add(dust);
              activeParticles.push({
                mesh: dust,
                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.02, 0.01 + Math.random() * 0.02, (Math.random() - 0.5) * 0.02),
                life: 0,
                maxLife: 15,
              });
            }

          } else {
            // Decay speed
            player.vx *= 0.75;
            player.vz *= 0.75;
            if (player.currentAction !== "dance" && player.currentAction !== "attack") {
              player.currentAction = "idle";
            }
          }
        } else {
          // Locked deceleration
          player.vx *= 0.5;
          player.vz *= 0.5;
        }

        // Apply JUMP mechanics
        const grav = -0.15;
        if (!player.isGrounded) {
          player.vy += grav;
          if (player.vy < -0.8) player.vy = -0.8; // cap fall speed
        }

        if (keys.jump && player.isGrounded && !isControlLocked) {
          player.vy = 2.4;
          player.isGrounded = false;
          sound.playJump();
          spawnImpactParticle(player.x, player.y - 0.9, player.z, 0xffffff, 6);
        }

        // Update 3D Positions
        player.x += player.vx;
        player.y += player.vy;
        player.z += player.vz;

        // Ground Clamping
        if (player.y <= 1.0) {
          player.y = 1.0;
          player.vy = 0;
          player.isGrounded = true;
        }

        // Arena Bounds checking (Keep inside 50x50 ground)
        if (player.x < -24.2) player.x = -24.2;
        if (player.x > 24.2) player.x = 24.2;
        if (player.z < -24.2) player.z = -24.2;
        if (player.z > 24.2) player.z = 24.2;

        // Update 3D player mesh coords
        playerMesh.position.set(player.x, player.y + 0.8, player.z);
        playerLight.position.set(player.x, player.y + 0.5 + 0.8, player.z);

        // Blinking indicator if invulnerable
        if (player.isInvulnerable > 0) {
          playerMesh.visible = Math.floor(player.isInvulnerable / 4) % 2 === 0;
        } else {
          playerMesh.visible = true;
        }

        // 17. COLLISION CHECKS
        // A. Collectibles collisions
        collectibles.forEach((item) => {
          if (!item.collected) {
            const dx = item.startX - player.x;
            const dz = item.startZ - player.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < 1.2 && Math.abs(player.y - 1.0) < 1.2) {
              item.collected = true;
              item.mesh.visible = false;
              if (item.light) item.light.visible = false;
              sound.playCollect();

              // Visual score spark explosion
              spawnImpactParticle(item.startX, 0.5, item.startZ, item.type === "mask" ? 0xef4444 : item.type === "bell" ? 0xfacc15 : 0x22c55e, 12);

              // Update Score state
              const pts = item.type === "mask" ? 250 : item.type === "bell" ? 100 : 150;
              s.score += pts;
              setScore(s.score);
              setCollectiblesCollected((prev) => ({
                ...prev,
                [item.type]: prev[item.type] + 1
              }));
            }
          }
        });

        // B. Ghost patrol collisions
        enemies.forEach((ghost) => {
          if (ghost.isDead) return;
          const dx = ghost.mesh.position.x - player.x;
          const dz = ghost.mesh.position.z - player.z;
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist < 1.25 && Math.abs(player.y - 1.0) < 1.2 && player.isInvulnerable <= 0) {
            damagePlayer(ghost.mesh.position.x, ghost.mesh.position.z);
          }
        });

        // C. Thorn obstacle collisions
        thorns.forEach((thorn) => {
          const dx = thorn.x - player.x;
          const dz = thorn.z - player.z;
          const dist = Math.sqrt(dx * dx + dz * dz);

          // Thorn only hits if player is on ground Y = 1.0
          if (dist < 0.9 && player.y <= 1.15 && player.isInvulnerable <= 0) {
            damagePlayer(thorn.x, thorn.z);
          }
        });

        // D. Victory Gate check
        const gateDx = player.x; // Gate at 0
        const gateDz = -22 - player.z; // Gate at -22
        const gateDist = Math.sqrt(gateDx * gateDx + gateDz * gateDz);
        if (gateDist < 1.6 && Math.abs(player.y - 1.0) < 1.5) {
          if (portalMesh.visible) {
            setGameState("ending");
            s.gameState = "ending";
            sound.stopMusic();
            sound.playGameWin();

            // Spawn incredible victory colorful particles!
            spawnImpactParticle(0, 1.5, -22, 0xeab308, 30);
            spawnImpactParticle(0, 1.5, -22, 0xef4444, 30);
            spawnImpactParticle(0, 1.5, -22, 0x22c55e, 30);

            // Spawn the NPC walk-in!
            spawnNPC();
          }
        }

        // 18. RUN SPRITESHEET ANIMATION MANAGER
        player.animTimer += dt;
        const animSpeed = player.currentAction === "attack" ? 60 : player.currentAction === "dance" ? 100 : 130;
        
        if (player.animTimer >= animSpeed) {
          player.animTimer = 0;
          player.currentFrame++;
          
          if (player.currentFrame >= 4) {
            if (player.currentAction === "attack") {
              // Action ended, fall back to walk or idle
              player.currentAction = "idle";
              keys.attack = false;
            }
            player.currentFrame = 0;
          }
        }

        // 19. ANIMATE THE RENDER MULTIPLEXES
        // A. Character spritesheet UV shift
        const row = player.currentAction === "idle" ? 0 : player.currentAction === "walk" ? 1 : player.currentAction === "attack" ? 2 : 3;
        playerTexture.offset.set(player.currentFrame * 0.25, (3 - row) * 0.25);

        // B. Cylindrical billboarding: Rotate player flatly towards camera position
        playerMesh.lookAt(camera.position.x, playerMesh.position.y, camera.position.z);
        // Apply horizontal flip scale
        playerMesh.scale.set(player.facingLeft ? -1.8 : 1.8, 1.8, 1.8);

        // C. Camera smooth follow player
        const targetCamX = player.x;
        const targetCamY = player.y + 5.2;
        const targetCamZ = player.z + 7.8; // Angle camera slightly downwards and back

        camera.position.x += (targetCamX - camera.position.x) * 0.085;
        camera.position.y += (targetCamY - camera.position.y) * 0.085;
        camera.position.z += (targetCamZ - camera.position.z) * 0.085;
        camera.lookAt(new THREE.Vector3(player.x, player.y + 0.3, player.z));

        // D. Spin and bob floating Collectibles
        collectibles.forEach((item, index) => {
          if (!item.collected) {
            item.mesh.rotation.y += 0.025;
            item.mesh.position.y = 0.6 + Math.sin(timestamp * 0.003 + index) * 0.12;
          }
        });

        // F. Spawning and animating falling energy items (สุ่มตกลงมาทั่วแผนที่ให้ตัวละครเดินไปเก็บเพื่อเติมพลัง)
        const currentTime = timestamp;
        if (currentTime - lastItemSpawnTime > 4500) { // spawn an item every 4.5 seconds
          lastItemSpawnTime = currentTime;
          const spawnX = (Math.random() - 0.5) * 44; // anywhere on 50x50 map
          const spawnZ = (Math.random() - 0.5) * 40;
          const spawnY = 14.0; // Start high up in the sky

          const fMesh = new THREE.Mesh(itemEnergyGeo, itemEnergyMat);
          fMesh.position.set(spawnX, spawnY, spawnZ);
          scene.add(fMesh);

          const fLight = new THREE.PointLight(0x10b981, 2.5, 4); // bright green
          fLight.position.set(0, 0, 0);
          fMesh.add(fLight);

          fallingItems.push({
            id: itemSpawnCounter++,
            x: spawnX,
            y: spawnY,
            z: spawnZ,
            vy: -0.05 - Math.random() * 0.05, // random falling speed
            mesh: fMesh,
            light: fLight,
            collected: false,
            spawnTime: currentTime,
          });
        }

        // Move, check collection, and update falling energy items
        for (let fi = fallingItems.length - 1; fi >= 0; fi--) {
          const item = fallingItems[fi];

          // Apply falling movement
          if (item.y > 0.6) {
            item.y += item.vy;
            if (item.y < 0.6) item.y = 0.6; // Land on ground
            item.mesh.position.y = item.y;
          } else {
            // Bob slightly on ground
            item.mesh.position.y = 0.6 + Math.sin(timestamp * 0.005 + item.id) * 0.08;
          }

          // Face camera
          item.mesh.lookAt(camera.position.x, item.mesh.position.y, camera.position.z);
          // Spin slightly
          item.mesh.rotation.z += 0.012;

          // Check direct collection
          const dx = item.x - player.x;
          const dz = item.z - player.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 1.3 && Math.abs(player.y - item.y) < 1.5 && !item.collected) {
            item.collected = true;
            sound.playCollect();

            // Restore life up to 5 max
            if (s.lives < 5) {
              s.lives += 1;
              setLives(s.lives);
            }
            s.score += 50;
            setScore(s.score);

            spawnImpactParticle(item.x, item.y, item.z, 0x10b981, 15);
            scene.remove(item.mesh);
            fallingItems.splice(fi, 1);
            continue;
          }

          // Optional timeout: Remove if on ground for more than 16 seconds to avoid overcrowding
          if (currentTime - item.spawnTime > 16000) {
            scene.remove(item.mesh);
            fallingItems.splice(fi, 1);
          }
        }

        // E. Animate ghostly patrollers
        for (let gIdx = enemies.length - 1; gIdx >= 0; gIdx--) {
          const ghost = enemies[gIdx];

          if (ghost.isDead) {
            ghost.deadTimer++;
            
            // Gravity downward pull
            ghost.deadVelocityY -= 0.015;

            ghost.mesh.position.x += ghost.deadVelocityX;
            ghost.mesh.position.y += ghost.deadVelocityY;
            ghost.mesh.position.z += ghost.deadVelocityZ;

            // Roll / tumble spin of the dead ghost
            ghost.mesh.rotation.z += 0.15;
            ghost.mesh.rotation.y += 0.1;

            // Rapid blink visible / invisible
            ghost.mesh.visible = (ghost.deadTimer % 4 < 2);

            // Clean up if out of play bound or too old
            if (ghost.mesh.position.y < -12.0 || ghost.deadTimer > 150) {
              scene.remove(ghost.mesh);
              enemies.splice(gIdx, 1);
              continue;
            }
          } else if (ghost.isKnockedBack) {
            // Knockback movement
            ghost.mesh.position.x += ghost.knockbackX;
            ghost.mesh.position.z += ghost.knockbackZ;

            // Friction / decay knockback speed
            ghost.knockbackX *= 0.88;
            ghost.knockbackZ *= 0.88;

            ghost.knockbackTimer--;
            if (ghost.knockbackTimer <= 0) {
              ghost.isKnockedBack = false;
              ghost.flashColor = "none";
            }
          } else {
            // ACTIVE CHASE PLAYER AI
            const dx = player.x - ghost.mesh.position.x;
            const dz = player.z - ghost.mesh.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist > 1.3) {
              // Standard pathfinding walk towards player
              const dirX = dx / dist;
              const dirZ = dz / dist;

              // Chase speed
              const moveSpeed = ghost.speed * 0.035;
              ghost.mesh.position.x += dirX * moveSpeed;
              ghost.mesh.position.z += dirZ * moveSpeed;

              ghost.currentRow = 1; // Row 1 is Stand, Row 2 is Walk (index 1)

              // Default facing is LEFT. Flip horizontally if moving RIGHT (dirX > 0)
              const scaleX = dirX > 0 ? -1.8 : 1.8;
              ghost.mesh.scale.set(scaleX, 1.8, 1.8);
            } else {
              // Very close to player: Stand and Attack!
              ghost.currentRow = 0; // Row 1 is Stand (index 0)

              // Face the player
              const dirX = dx >= 0 ? 1 : -1;
              const scaleX = dirX > 0 ? -1.8 : 1.8;
              ghost.mesh.scale.set(scaleX, 1.8, 1.8);

              // Perform attack flash
              if (ghost.attackCooldown <= 0) {
                ghost.isAttacking = true;
                ghost.attackTimer = 18; // 18 frames of red flashing attack
                ghost.attackCooldown = 55; // ticks cooldown
                ghost.flashColor = "red";
              }
            }

            // Bobbing hover vertical offsets
            ghost.mesh.position.y = 1.65 + Math.sin(timestamp * 0.005 + ghost.id) * 0.12;

            // Cooldown ticks
            if (ghost.attackCooldown > 0) {
              ghost.attackCooldown--;
            }
            if (ghost.isAttacking) {
              ghost.attackTimer--;
              if (ghost.attackTimer <= 0) {
                ghost.isAttacking = false;
                ghost.flashColor = "none";
              }
            }
          }

          // 2D Billboarding: Rotate Group towards camera flatly so sprites face user
          ghost.mesh.lookAt(camera.position.x, ghost.mesh.position.y, camera.position.z);

          // Update Spritesheet animation frames
          ghost.animTimer += dt;
          const ghostAnimSpeed = 120; // 120ms per frame
          if (ghost.animTimer >= ghostAnimSpeed) {
            ghost.animTimer = 0;
            ghost.currentFrame = (ghost.currentFrame + 1) % 4;
          }

          // Apply shifting offsets onto cloned individual texture map
          const spriteMesh = ghost.mesh.children[0] as THREE.Mesh;
          const mat = spriteMesh ? (spriteMesh.material as THREE.MeshStandardMaterial) : null;
          if (mat) {
            if (mat.map) {
              // U: frame * 0.25, V: (1 - row) * 0.5
              mat.map.offset.set(ghost.currentFrame * 0.25, (1 - ghost.currentRow) * 0.5);
            }

            // Apply solid or emissive color flashing/glowing reactions
            if (ghost.flashColor === "red") {
              mat.color.setHex(0xff2222);
              mat.emissive.setHex(0xff0000);
              mat.emissiveIntensity = 1.3;
            } else if (ghost.flashColor === "white" || ghost.flashColor === "white_rapid") {
              mat.color.setHex(0xffffff);
              mat.emissive.setHex(0xffffff);
              mat.emissiveIntensity = 5.0; // Glow pure bright white
            } else {
              mat.color.setHex(0xffffff);
              mat.emissive.setHex(0x000000);
              mat.emissiveIntensity = 0.0;
            }
          }
        }

        // F. Portal gate spinning light aura
        portalMesh.rotation.z += 0.012;
        portalFill.rotation.y += 0.008;

        // G. Decay and move particles
        for (let pIndex = activeParticles.length - 1; pIndex >= 0; pIndex--) {
          const p = activeParticles[pIndex];
          p.mesh.position.add(p.velocity);
          p.life++;

          // Reduce scale slightly to fade
          const remainingLifeRatio = 1.0 - p.life / p.maxLife;
          p.mesh.scale.setScalar(remainingLifeRatio);

          if (p.life >= p.maxLife) {
            scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            if (Array.isArray(p.mesh.material)) {
              p.mesh.material.forEach((m) => m.dispose());
            } else {
              p.mesh.material.dispose();
            }
            activeParticles.splice(pIndex, 1);
          }
        }

        // H. Update grass squishing based on player proximity
        grasses.forEach((grass) => {
          const gdx = player.x - grass.startX;
          const gdz = player.z - grass.startZ;
          const distToPlayer = Math.sqrt(gdx * gdx + gdz * gdz);

          // If player steps on the grass (within 0.85 distance), squish it on Y.
          // Otherwise, stretch it back to its base height.
          if (distToPlayer < 0.85) {
            grass.targetScaleY = grass.baseHeight * 0.18; // 18% of normal height
          } else {
            grass.targetScaleY = grass.baseHeight;
          }

          // Smoothly interpolate currentScaleY towards targetScaleY
          grass.currentScaleY += (grass.targetScaleY - grass.currentScaleY) * 0.15;

          // Apply scale and update position.y so the bottom of the grass stays on ground (Y = 0)
          grass.mesh.scale.set(grass.baseWidth, grass.currentScaleY, 1.0);
          grass.mesh.position.y = grass.currentScaleY / 2;

          // Make the grass face the camera (Y-axis billboard or full billboard)
          grass.mesh.lookAt(camera.position.x, grass.mesh.position.y, camera.position.z);
        });

        // I. Update Boss State and Movement
        if (boss.active && !boss.defeated && boss.mesh) {
          // Decrement the state-machine pattern timer
          boss.patternTimer -= dt;

          let lerpSpeed = 0.025;
          let scaleMult = 1.0;

          // BOSS PATTERN STATE MACHINE
          if (boss.patternState === "idle") {
            // Nิ่ง: Hovering in place gently bobbing, slowly adjusting position
            boss.currentRow = 0; // standard idle spritesheet frame row
            boss.moveTimer -= dt;
            if (boss.moveTimer <= 0) {
              boss.moveTimer = 1000 + Math.random() * 1000;
              boss.targetX = (Math.random() - 0.5) * 16;
              boss.targetY = 3.0 + Math.random() * 1.5;
              boss.targetZ = -14 + Math.random() * 8;
            }
            
            // Add custom bobbing
            const bob = Math.sin(timestamp * 0.003) * 0.08;
            boss.mesh.position.y += bob;

            if (boss.patternTimer <= 0) {
              // Switch to dash_prep step
              boss.patternState = "dash_prep";
              boss.patternTimer = 1000; // 1 second prep
              boss.targetX = boss.x; // stop moving during prep
              boss.targetY = boss.y;
              boss.targetZ = boss.z;
            }
          } 
          else if (boss.patternState === "dash_prep") {
            // ก่อนพุ่ง: Pulsate scale quickly to signal
            boss.currentRow = 0;
            // Pulsate quickly
            scaleMult = 1.0 + Math.sin(timestamp * 0.025) * 0.18;

            if (boss.patternTimer <= 0) {
              // Decide Near or Far Dash
              const dashNear = Math.random() < 0.6;
              if (dashNear) {
                // Dash near the player
                boss.targetX = player.x + (Math.random() - 0.5) * 3.5;
                boss.targetZ = player.z + (Math.random() - 0.5) * 3.5;
                boss.targetY = 1.2 + Math.random() * 1.2; // descends lower!
              } else {
                // Dash far
                boss.targetX = (Math.random() - 0.5) * 38;
                boss.targetZ = -20 + Math.random() * 8;
                boss.targetY = 4.0 + Math.random() * 1.5; // fly higher!
              }

              // Clamp targets inside arena borders
              boss.targetX = Math.max(-23, Math.min(23, boss.targetX));
              boss.targetZ = Math.max(-23, Math.min(23, boss.targetZ));
              boss.targetY = Math.max(1.0, Math.min(6.0, boss.targetY));

              boss.patternState = "dash";
              boss.patternTimer = 750; // fast dash duration
              sound.playJump(); // play dynamic dash whoosh/sfx
              spawnImpactParticle(boss.x, boss.y, boss.z, 0xa855f7, 15);
            }
          }
          else if (boss.patternState === "dash") {
            // พุ่งไกล-ใกล้: Move lightning fast to target
            boss.currentRow = 0;
            lerpSpeed = 0.14; // rapid lerp velocity

            // Trail dash sparkle particles
            if (Math.random() < 0.3) {
              spawnImpactParticle(boss.x, boss.y, boss.z, 0xa855f7, 2);
            }

            if (boss.patternTimer <= 0) {
              // Dash completes, prepare for attack
              boss.patternState = "attack_prep";
              boss.patternTimer = 1400; // 1.4 seconds warning steps before attack
              boss.targetX = boss.x; // hover stable
              boss.targetY = boss.y;
              boss.targetZ = boss.z;
            }
          }
          else if (boss.patternState === "attack_prep") {
            // ก่อนโยนลูกไฟจะขยายย่อ เป็น step บอก: Discrete rapid pulse steps
            boss.currentRow = 0;
            const steps = Math.floor(timestamp / 120) % 2;
            scaleMult = steps === 0 ? 1.45 : 0.82; // clear step scale visual feedback

            if (boss.patternTimer <= 0) {
              // Launch skyward meteor fireballs!
              boss.patternState = "attack";
              boss.patternTimer = 1000; // shooting state duration
              triggerBossShoot();
            }
          }
          else if (boss.patternState === "attack") {
            // ยิงลูกไฟ: stays in shooting pose
            boss.currentRow = 1;
            boss.targetX = boss.x;
            boss.targetY = boss.y;
            boss.targetZ = boss.z;

            if (boss.patternTimer <= 0) {
              // Return back to standard hover idle
              boss.patternState = "idle";
              boss.patternTimer = 2200 + Math.random() * 1500; // 2.2 - 3.7s idle
              boss.currentRow = 0;
              boss.moveTimer = 0; // immediate new hover spot selection
            }
          }

          // Move Boss smoothly towards the resolved target
          boss.mesh.position.x += (boss.targetX - boss.mesh.position.x) * lerpSpeed;
          boss.mesh.position.y += (boss.targetY - boss.mesh.position.y) * lerpSpeed;
          boss.mesh.position.z += (boss.targetZ - boss.mesh.position.z) * lerpSpeed;

          boss.x = boss.mesh.position.x;
          boss.y = boss.mesh.position.y;
          boss.z = boss.mesh.position.z;

          // 2. Face Camera / flip depending on direction
          boss.mesh.lookAt(camera.position.x, boss.mesh.position.y, camera.position.z);
          const facingLeft = boss.targetX < boss.mesh.position.x;
          const currentScaleScalar = 1.0 * scaleMult;
          boss.mesh.scale.set(facingLeft ? currentScaleScalar : -currentScaleScalar, currentScaleScalar, currentScaleScalar);

          // 3. Boss spritesheet frame toggling
          boss.animTimer += dt;
          if (boss.animTimer >= 220) {
            boss.animTimer = 0;
            boss.currentFrame = (boss.currentFrame + 1) % 2;
          }

          if (boss.material && bossTexture) {
            bossTexture.offset.set(boss.currentFrame * 0.5, (1 - boss.currentRow) * 0.5);
          }

          // 4. Hit Flash processing
          if (boss.flashTimer > 0) {
            boss.flashTimer--;
            if (boss.material) {
              boss.material.color.setHex(0xff0000); // Red flash when hurt
              boss.material.emissive.setHex(0xff0000);
              boss.material.emissiveIntensity = 0.8;
            }
          } else {
            if (boss.material) {
              boss.material.color.setHex(0xffffff);
              boss.material.emissive.setHex(0x000000);
              boss.material.emissiveIntensity = 0.0;
            }
          }
        }

        // J. Update Boss falling bullets
        for (let bIdx = bossBullets.length - 1; bIdx >= 0; bIdx--) {
          const bullet = bossBullets[bIdx];
          bullet.lifetime++;

          if (!bullet.isFalling) {
            // Projectile is flying upwards
            bullet.currentY += bullet.speedY;
            bullet.speedY -= 0.008; // decelerate upward velocity
            
            // Curve horizontally slightly towards targets
            bullet.mesh.position.x += (bullet.targetX - bullet.mesh.position.x) * 0.04;
            bullet.mesh.position.z += (bullet.targetZ - bullet.mesh.position.z) * 0.04;
            bullet.mesh.position.y = bullet.currentY;

            // Pulsing warning ring
            bullet.warningCircle.scale.setScalar(1.0 + Math.sin(bullet.lifetime * 0.15) * 0.15);

            if (bullet.speedY <= 0) {
              bullet.isFalling = true;
              bullet.speedY = 0; // begin falling
            }
          } else {
            // Projectile is falling down
            bullet.speedY += 0.012; // gravity acceleration
            bullet.currentY -= bullet.speedY;

            bullet.mesh.position.y = bullet.currentY;
            bullet.mesh.position.x += (bullet.targetX - bullet.mesh.position.x) * 0.15;
            bullet.mesh.position.z += (bullet.targetZ - bullet.mesh.position.z) * 0.15;

            // Make warning circle expand / glow intensely
            const progress = Math.max(0, Math.min(1.0, (8.0 - bullet.currentY) / 8.0));
            const ringMat = bullet.warningCircle.material as THREE.MeshBasicMaterial;
            if (ringMat) {
              ringMat.opacity = 0.3 + progress * 0.7;
            }
            bullet.warningCircle.scale.setScalar(1.0 - progress * 0.35);

            // Ground/Floor hit collision check
            if (bullet.currentY <= 0.15) {
              // Meteor explodes on floor!
              spawnImpactParticle(bullet.targetX, 0.1, bullet.targetZ, 0xef4444, 15);
              sound.playHit();

              // Check if player stands in the blast radius
              const bdx = player.x - bullet.targetX;
              const bdz = player.z - bullet.targetZ;
              const distToImpact = Math.sqrt(bdx * bdx + bdz * bdz);

              if (distToImpact < 1.35 && player.y <= 1.25) {
                damagePlayer(bullet.targetX, bullet.targetZ);
              }

              // De-allocate Three assets
              scene.remove(bullet.mesh);
              scene.remove(bullet.warningCircle);

              bossBullets.splice(bIdx, 1);
            }
          }
        }

      } else if (s.gameState === "ending") {
        // A. Maintain particles decay and movement during victory cutscene
        for (let pIndex = activeParticles.length - 1; pIndex >= 0; pIndex--) {
          const p = activeParticles[pIndex];
          p.mesh.position.add(p.velocity);
          p.life++;
          const remainingLifeRatio = Math.max(0, 1.0 - p.life / p.maxLife);
          p.mesh.scale.setScalar(remainingLifeRatio);
          if (p.life >= p.maxLife) {
            scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            if (Array.isArray(p.mesh.material)) {
              p.mesh.material.forEach((m) => m.dispose());
            } else {
              p.mesh.material.dispose();
            }
            activeParticles.splice(pIndex, 1);
          }
        }

        // B. Keep gold portal gate spinning beautifully in the background
        if (portalMesh && portalFill) {
          portalMesh.rotation.z += 0.012;
          portalFill.rotation.y += 0.008;
        }

        // C. Update NPC movement and spritesheet frame animation
        if (npc.spawned && npc.mesh) {
          npc.animTimer += dt;
          if (npc.animTimer >= 150) {
            npc.animTimer = 0;
            npc.currentFrame = (npc.currentFrame + 1) % 4;
          }

          if (npcTexture) {
            npcTexture.offset.set(npc.currentFrame * 0.25, (1 - npc.currentRow) * 0.5);
          }

          // Move forward towards the player
          if (npc.mesh.position.z < npc.targetZ) {
            npc.mesh.position.z += 0.045 * (dt / 16.6); // smooth walk speed
            npc.currentRow = 0; // walking sprite row
            
            // Spawn little magical green footprints as they walk
            if (Math.random() < 0.12) {
              spawnImpactParticle(npc.mesh.position.x, 0.2, npc.mesh.position.z, 0x22c55e, 2);
            }
          } else {
            // Stop and stand idle facing the player
            npc.mesh.position.z = npc.targetZ;
            npc.currentRow = 0;
            npc.currentFrame = 0; // stand still
            
            // Once fully arrived, trigger the React RPG dialog overlay
            if (!showDialogue) {
              setShowDialogue(true);
              setDialogueIndex(0);
            }
          }

          npc.x = npc.mesh.position.x;
          npc.y = npc.mesh.position.y;
          npc.z = npc.mesh.position.z;

          // Face the camera or player
          npc.mesh.lookAt(camera.position.x, npc.mesh.position.y, camera.position.z);
        }

        // D. Player faces the NPC and stands idle/proud
        if (playerMesh) {
          playerMesh.lookAt(0, playerMesh.position.y, -20);
          // Gently bob the player up and down
          const pBob = Math.sin(timestamp * 0.002) * 0.03;
          playerMesh.position.y = 1.8 + pBob;
        }
      }

      // Render actual Frame
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    // 20. CLEANUP UNMOUNTS
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("dansai-game-restart", handleResetEvent);
      resizeObserver.disconnect();
      
      // Cleanup geometries and meshes
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      });
    };
  }, [settings, gameState]);

  const scoreLabel = String(score).padStart(6, "0");

  return (
    <div id="game-screen-root" className="w-full max-w-5xl mx-auto px-4 relative flex flex-col gap-3 h-full select-none">
      
      {/* Upper HUD Header Row */}
      <div className="flex items-center justify-between bg-zinc-950/85 border border-zinc-800/80 px-4 py-2.5 rounded-xl backdrop-blur-sm shadow-lg font-sans">
        <div className="flex items-center gap-6">
          {/* Health Hearts */}
          <div className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-xs text-zinc-400 font-kanit mr-1.5">พลังชีวิต:</span>
            {[1, 2, 3, 4, 5].map((heart) => (
              <Heart 
                key={heart} 
                className={`w-4 h-4 transition-all duration-300 ${
                  heart <= lives 
                    ? "text-red-500 fill-red-500 scale-110 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]" 
                    : "text-zinc-700 scale-90"
                }`}
              />
            ))}
          </div>

          {/* Collectible counts */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-kanit text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-500">เก็บสะสม:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 block shadow-glow-red"></span>
              หน้ากาก {collectiblesCollected.mask}/4
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 block shadow-glow-gold"></span>
              กระดิ่ง {collectiblesCollected.bell}/4
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 block shadow-glow-green"></span>
              กระติบ {collectiblesCollected.rice}/4
            </span>
          </div>
        </div>

        {/* Score & Controls */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block text-[10px] text-zinc-500 font-display tracking-widest leading-none uppercase">Score</span>
            <span className="text-lg font-mono font-bold text-yellow-500 drop-shadow-[0_0_4px_rgba(234,179,8,0.25)]">{scoreLabel}</span>
          </div>

          <button
            onClick={togglePause}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-all cursor-pointer"
            title="Pause Game"
          >
            {gameState === "paused" ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-zinc-300" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onExit();
            }}
            className="p-2.5 bg-zinc-900/60 hover:bg-red-950/40 hover:text-red-400 border border-zinc-800/80 hover:border-red-900/40 text-zinc-400 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-kanit shadow-sm"
            title="ออกจากเกมกลับหน้าหลัก"
          >
            <Home className="w-4 h-4" />
            <span className="hidden md:inline">ออกจากเกม</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Container Frame */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-[16/9] bg-[#0a0518] border border-red-500/20 hover:border-red-500/35 rounded-2xl overflow-hidden shadow-2xl transition-all"
      >
        {/* Mount point for ThreeJS */}
        <div ref={mountRef} className="w-full h-full block" />

        {/* Dynamic Full Screen Hit Red Flash Overlay */}
        {isHitFlash && (
          <div className="absolute inset-0 bg-red-600/30 border border-red-500/50 pointer-events-none z-30 animate-pulse" />
        )}

        {/* Mini HUD Skill Indicator */}
        <div className="absolute bottom-4 left-4 bg-black/75 px-3 py-2 rounded-xl text-xs font-kanit text-zinc-300 border border-zinc-800/80 pointer-events-none z-10 flex items-center gap-2 backdrop-blur-sm">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${showSkillCooldown ? "bg-zinc-800 border-zinc-700 text-zinc-500" : "bg-red-600 border-red-500 text-white animate-pulse"}`}>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="block text-[9px] text-zinc-500 uppercase font-sans tracking-wide leading-none">Special Skill (กด O)</span>
            <span className="text-xs font-medium">{showSkillCooldown ? "ชาร์จพลังเต้น..." : "พร้อมเปิดพลังสะสม!"}</span>
          </div>
        </div>

        {/* Dynamic map title indicator */}
        <div className="absolute top-4 right-4 bg-black/75 px-3 py-1.5 rounded-lg text-[10px] font-mono text-indigo-400 border border-zinc-800 pointer-events-none z-10 flex items-center gap-1.5 backdrop-blur-sm">
          <Compass className="w-3.5 h-3.5 text-red-500" />
          <span>ด่านซ้ายอารีน่า (Dan Sai 3D Arena - 50x50)</span>
        </div>

        {/* Boss HP Bar Overlay */}
        {bossActive && !bossDefeated && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-72 bg-black/85 border border-purple-500/30 p-2.5 rounded-xl z-10 flex flex-col items-center gap-1.5 shadow-xl shadow-purple-500/5 backdrop-blur-md">
            <div className="flex items-center gap-1.5 w-full justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 font-sans">พญาผีหลวง (Boss)</span>
              <span className="text-[11px] font-mono text-purple-300 font-bold">{bossHp}/{bossMaxHp} HP</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden p-[2px]">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-full transition-all duration-300"
                style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Enemies Defeated HUD / Portal Warp Announcement */}
        <div className="absolute top-16 left-4 bg-black/75 px-3 py-2 rounded-lg text-[10px] font-kanit text-zinc-300 border border-zinc-800 pointer-events-none z-10 flex flex-col gap-0.5 backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
            <span>ปราบศัตรู: <strong className="text-purple-400">{enemiesDefeated}</strong> / 10 ตัว</span>
          </div>
          {enemiesDefeated >= 10 && (
            <div className="text-yellow-500 font-bold text-[9px] uppercase tracking-wide mt-1">
              {bossDefeated ? "⚡ ประตูวาร์ปทองเปิดแล้ว! เดินเข้าไปเลย!" : "👾 บอสใหญ่ พญาผีหลวง ปรากฏตัวแล้ว!"}
            </div>
          )}
        </div>

        {/* HUD overlay labels for Debug & Performance */}
        {settings.showFps && (
          <div className="absolute top-4 left-4 bg-black/75 px-2.5 py-1 rounded text-[10px] font-mono text-emerald-400 border border-zinc-800 pointer-events-none z-10 space-y-0.5 backdrop-blur-sm">
            <div>FPS: {fps}</div>
            <div>RENDER: THREE.JS WEBGL</div>
            <div>DIFF: {settings.difficulty.toUpperCase()}</div>
          </div>
        )}

        {/* Pause Overlay UI */}
        {gameState === "paused" && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-20 font-sans">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 max-w-sm text-center shadow-2xl space-y-5"
            >
              <Pause className="w-12 h-12 text-yellow-500 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-kanit text-white">หยุดเกมชั่วคราว</h3>
                <p className="text-sm text-zinc-400 font-kanit">สืบสานการผจญภัยเมืองด่านซ้ายเมื่อพร้อม</p>
              </div>
              <div className="flex flex-col gap-2.5 w-full">
                <div className="flex gap-2 w-full justify-center">
                  <button
                    onClick={togglePause}
                    className="flex-1 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold font-kanit transition-all cursor-pointer"
                  >
                    เล่นต่อ
                  </button>
                  <button
                    onClick={handleRestart}
                    className="flex-1 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-sm font-semibold font-kanit transition-all cursor-pointer"
                  >
                    เริ่มใหม่
                  </button>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    onExit();
                  }}
                  className="w-full px-4 py-2 bg-zinc-900/70 hover:bg-red-950/40 hover:text-red-400 border border-zinc-800/80 hover:border-red-900/40 text-zinc-400 rounded-xl text-sm font-semibold font-kanit transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Home className="w-4 h-4" />
                  ออกจากเกมกลับหน้าหลัก
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === "gameover" && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 font-sans">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md text-center p-6 space-y-6"
            >
              <span className="inline-block text-xs uppercase tracking-widest text-red-500 bg-red-950/45 border border-red-900/30 px-3 py-1 rounded-full font-semibold">Game Over</span>
              <h2 className="text-4xl font-extrabold text-white font-kanit leading-tight">วิญญาณผีตาโขนหมดแรง!</h2>
              <p className="text-sm text-zinc-400 font-kanit max-w-xs mx-auto">
                ไม่เป็นไรนะวิญญาณแห่งด่านซ้าย สามารถเริ่มต้นออกผจญภัยเก็บสะสมใหม่อีกครั้ง!
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm font-kanit shadow-lg shadow-red-600/25 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  ลองใหม่อีกครั้ง
                </button>
                <button
                  onClick={onExit}
                  className="flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl font-bold text-sm font-kanit transition-all cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  กลับหน้าเมนู
                </button>
              </div>
            </motion.div>
          </div>
        )}

         {/* RPG Dialogue Screen Overlay during Ending state */}
        {gameState === "ending" && showDialogue && (
          <div className="absolute inset-x-0 bottom-0 top-0 bg-black/45 flex flex-col justify-end p-4 z-20 font-sans pointer-events-auto">
            {/* Visual presentation of left (player) and right (NPC) speakers standing */}
            <div className="flex-1 w-full flex items-end justify-between px-6 sm:px-12 pointer-events-none mb-1">
              
              {/* Left Speaker: Player */}
              <motion.div 
                initial={{ x: -80, opacity: 0 }}
                animate={{ 
                  x: 0, 
                  opacity: 1,
                  scale: ENDING_DIALOGUES[dialogueIndex].side === "left" ? 1.05 : 0.9,
                  filter: ENDING_DIALOGUES[dialogueIndex].side === "left" ? "brightness(1) saturate(1)" : "brightness(0.55) saturate(0.55)"
                }}
                transition={{ type: "spring", stiffness: 100 }}
                className="flex flex-col items-center gap-2 drop-shadow-[0_4px_12px_rgba(239,68,68,0.25)]"
              >
                <div className="w-20 h-20 rounded-2xl border-2 border-red-500/50 bg-zinc-950/90 overflow-hidden flex items-center justify-center relative shadow-xl shadow-red-500/10">
                  <div 
                    className="absolute"
                    style={{
                      backgroundImage: `url("https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440018/player_mask_srkmbt.png")`,
                      backgroundSize: '320px 320px',
                      backgroundPosition: '0px 0px',
                      width: '80px',
                      height: '80px',
                      transform: 'scale(1.4)',
                    }}
                  />
                </div>
                <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-kanit border ${ENDING_DIALOGUES[dialogueIndex].side === "left" ? "bg-red-600 text-white border-red-500" : "bg-zinc-900 text-zinc-500 border-zinc-800"}`}>
                  ผีตาโขนน้อย (Player)
                </div>
              </motion.div>

              {/* Right Speaker: NPC */}
              <motion.div 
                initial={{ x: 80, opacity: 0 }}
                animate={{ 
                  x: 0, 
                  opacity: 1,
                  scale: ENDING_DIALOGUES[dialogueIndex].side === "right" ? 1.05 : 0.9,
                  filter: ENDING_DIALOGUES[dialogueIndex].side === "right" ? "brightness(1) saturate(1)" : "brightness(0.55) saturate(0.55)"
                }}
                transition={{ type: "spring", stiffness: 100 }}
                className="flex flex-col items-center gap-2 drop-shadow-[0_4px_12px_rgba(34,197,94,0.25)]"
              >
                <div className="w-20 h-20 rounded-2xl border-2 border-green-500/50 bg-zinc-950/90 overflow-hidden flex items-center justify-center relative shadow-xl shadow-green-500/10">
                  <div 
                    className="absolute"
                    style={{
                      backgroundImage: `url("https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440017/npc1_kgr83q.png")`,
                      backgroundSize: '256px 128px',
                      backgroundPosition: '0px 0px',
                      width: '64px',
                      height: '64px',
                      transform: 'scale(1.5)',
                    }}
                  />
                </div>
                <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-kanit border ${ENDING_DIALOGUES[dialogueIndex].side === "right" ? "bg-green-600 text-white border-green-500" : "bg-zinc-900 text-zinc-500 border-zinc-800"}`}>
                  พ่อแสน (NPC)
                </div>
              </motion.div>

            </div>

            {/* RPG Dialogue Box Frame */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={() => {
                if (dialogueIndex < ENDING_DIALOGUES.length - 1) {
                  setDialogueIndex(prev => prev + 1);
                  sound.playCollect();
                } else {
                  // Finish Dialogue -> Show victory screen!
                  setGameState("victory");
                  const s = stateRef.current;
                  s.gameState = "victory";
                  setShowDialogue(false);
                  sound.playGameWin();
                }
              }}
              className="w-full bg-zinc-950/95 border-2 border-yellow-500/40 hover:border-yellow-500/70 p-4 rounded-xl shadow-2xl backdrop-blur-md cursor-pointer transition-colors relative"
            >
              {/* Speaker name tab */}
              <div className="absolute -top-3 left-4 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-extrabold font-kanit px-4 py-0.5 rounded-md text-xs shadow-md border border-yellow-400">
                {ENDING_DIALOGUES[dialogueIndex].speaker}
              </div>

              {/* Dialogue text */}
              <div className="pt-2 min-h-[4rem] text-zinc-100 font-kanit text-sm sm:text-base leading-relaxed tracking-wide text-left">
                {ENDING_DIALOGUES[dialogueIndex].text}
              </div>

              {/* Indicator blinking prompt at bottom right */}
              <div className="w-full flex justify-end text-[10px] text-yellow-500 font-kanit uppercase font-bold tracking-widest gap-1 items-center animate-pulse pt-1">
                <span>{dialogueIndex < ENDING_DIALOGUES.length - 1 ? "คลิกเพื่ออ่านประโยคถัดไป ➔" : "ปราบสัจจะสำเร็จ จบเกม ➔"}</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* Victory Screen */}
        {gameState === "victory" && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-20 font-sans">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md text-center p-8 space-y-6 bg-gradient-to-b from-yellow-950/20 to-zinc-950 border border-yellow-500/20 rounded-2xl"
            >
              <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center mx-auto text-yellow-500 shadow-xl shadow-yellow-500/5 animate-bounce">
                <Trophy className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-yellow-500 font-bold font-sans">Victory Achieved - FINISH</span>
                <h2 className="text-4xl font-extrabold text-white font-kanit leading-tight">ถึงวัดเนรมิตสำเร็จ!</h2>
                <p className="text-sm text-zinc-400 font-kanit max-w-sm mx-auto">
                  ยินดีด้วย! คุณพาผีตาโขนผจญภัยปราบพญาผีหลวง เก็บสะสมเครื่องสักการะล้ำค่า และเดินทางเข้าสู่พระอารามหลวงอย่างสงบสุข!
                </p>
              </div>

              {/* Score Display box */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 max-w-xs mx-auto">
                <span className="block text-xs text-zinc-500 font-display uppercase tracking-widest font-sans">Final Score</span>
                <span className="text-2xl font-mono font-black text-yellow-500">{scoreLabel}</span>
              </div>
              
              <div className="flex gap-3 justify-center font-kanit">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  เล่นใหม่อีกครั้ง
                </button>
                <button
                  onClick={onExit}
                  className="flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  กลับหน้าเมนู
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Controller Reminder Footer Help */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-zinc-950/50 border border-zinc-900 px-4 py-3 rounded-xl text-xs text-zinc-500 font-kanit shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-red-500 animate-bounce" />
          <span>วิธีกดเล่น (ThreeJS 8-directional movement):</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-zinc-400">
          <div>เคลื่อนที่ 8 ทิศ: <span className="bg-zinc-900 text-white font-mono px-1.5 py-0.5 rounded border border-zinc-800 text-[10px]">W A S D</span> / <span className="bg-zinc-900 text-white font-mono px-1.5 py-0.5 rounded border border-zinc-800 text-[10px]">ลูกศรปุ่มกด</span></div>
          <div>กระโดด: <span className="bg-zinc-900 text-white font-mono px-1.5 py-0.5 rounded border border-zinc-800 text-[10px]">Space (สเปซบาร์)</span></div>
          <div>ต่อยโจมตี: <span className="bg-zinc-900 text-white font-mono px-1.5 py-0.5 rounded border border-zinc-800 text-[10px]">P</span> / <span className="bg-zinc-900 text-white font-mono px-1.5 py-0.5 rounded border border-zinc-800 text-[10px]">{settings.keybindings.interact}</span></div>
          <div>เต้นสกิลเก็บด่วน: <span className="bg-zinc-900 text-white font-mono px-1.5 py-0.5 rounded border border-zinc-800 text-[10px]">O</span></div>
        </div>
      </div>

    </div>
  );
}
