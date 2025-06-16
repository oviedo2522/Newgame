const player = document.getElementById("player");
const shield = document.getElementById("shield");
const obstacles = Array.from(document.querySelectorAll(".obstacle"));
let shieldActive = false;
let shieldCooldown = false;

const powerUpSound = new Audio("power-up.mp3");
const orbEffect = document.createElement("div");
orbEffect.className = "orb-effect";
document.body.appendChild(orbEffect);
orbEffect.style.display = "none";

orbEffect.style.position = "absolute";
orbEffect.style.width = "80px";
orbEffect.style.height = "80px";
orbEffect.style.borderRadius = "50%";
orbEffect.style.background = "radial-gradient(circle, rgba(255,255,0,0.9), rgba(255,165,0,0.6))";
orbEffect.style.pointerEvents = "none";
orbEffect.style.animation = "glow 0.5s ease-out";

const style = document.createElement("style");
style.textContent = `
@keyframes glow {
  0% {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 0 10px yellow;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
    box-shadow: 0 0 30px orange;
  }
}`;
document.head.appendChild(style);

// Initialize obstacle data
const obstacleData = [
  { speedX: 2, speedY: 2, dirX: 1, dirY: 1 },
  { speedX: 3, speedY: 1, dirX: -1, dirY: 1 },
  { speedX: 1, speedY: 3, dirX: 1, dirY: -1 },
];

// Set initial positions for obstacles to avoid NaN movement issues
obstacles.forEach((obstacle, index) => {
  obstacle.style.left = `${Math.random() * (window.innerWidth - 50)}px`;
  obstacle.style.bottom = `${Math.random() * (window.innerHeight - 150)}px`;
});

// Move player with arrow keys
document.addEventListener("keydown", (e) => {
    const left = parseInt(player.style.left || "50px");
    const bottom = parseInt(player.style.bottom || "100px");
  
    if (e.key === "ArrowRight" && left < window.innerWidth - 50) {
      player.style.left = `${left + 20}px`;
    } else if (e.key === "ArrowLeft" && left > 0) {
      player.style.left = `${left - 20}px`;
    } else if (e.key === "ArrowUp" && bottom < window.innerHeight - 50) {
      player.style.bottom = `${bottom + 20}px`;
    } else if (e.key === "ArrowDown" && bottom > 0) {
      player.style.bottom = `${bottom - 20}px`;
    }
  });

// Move obstacles
function moveObstacles() {
  obstacles.forEach((obstacle, index) => {
    const data = obstacleData[index];
    let left = parseInt(obstacle.style.left || "0");
    let bottom = parseInt(obstacle.style.bottom || "0");

    left += data.speedX * data.dirX;
    bottom += data.speedY * data.dirY;

    // Reverse direction at boundaries
    if (left <= 0 || left >= window.innerWidth - 50) data.dirX *= -1;
    if (bottom <= 0 || bottom >= window.innerHeight - 50) data.dirY *= -1;

    obstacle.style.left = `${left}px`;
    obstacle.style.bottom = `${bottom}px`;

    // Shoot projectiles from obstacles
    if (Math.random() < 0.02) shootProjectile(obstacle);
  });
  requestAnimationFrame(moveObstacles);
}
moveObstacles();

// Shoot projectiles
function shootProjectile(obstacle) {
  const projectile = document.createElement("div");
  projectile.className = "projectile";
  document.body.appendChild(projectile);

  const rect = obstacle.getBoundingClientRect();
  projectile.style.left = `${rect.left + rect.width / 2}px`;
  projectile.style.bottom = `${window.innerHeight - rect.bottom}px`;

  const targetX = player.getBoundingClientRect().left + 25;
  const targetY = window.innerHeight - player.getBoundingClientRect().bottom - 25;

  const dx = targetX - parseInt(projectile.style.left);
  const dy = targetY - parseInt(projectile.style.bottom);
  const distance = Math.sqrt(dx ** 2 + dy ** 2);

  projectile.velocityX = (dx / distance) * 5;
  projectile.velocityY = (dy / distance) * 5;

  function moveProjectile() {
    const left = parseInt(projectile.style.left);
    const bottom = parseInt(projectile.style.bottom);

    projectile.style.left = `${left + projectile.velocityX}px`;
    projectile.style.bottom = `${bottom + projectile.velocityY}px`;

    // Deflect on shield collision
    if (shieldActive && checkCollision(projectile, shield)) {
      projectile.velocityX *= -1;
      projectile.velocityY *= -1;
    }

    // Check for player collision
    if (checkCollision(projectile, player)) {
      alert("Game Over! You've been hit!");
      location.reload();
    }

    // Remove if off-screen
    if (
      left < 0 || left > window.innerWidth || bottom < 0 || bottom > window.innerHeight
    ) {
      projectile.remove();
      return;
    }
    requestAnimationFrame(moveProjectile);
  }
  moveProjectile();
}

// Check collision
function checkCollision(a, b) {
  const rectA = a.getBoundingClientRect();
  const rectB = b.getBoundingClientRect();
  return (
    rectA.left < rectB.right &&
    rectA.right > rectB.left &&
    rectA.top < rectB.bottom &&
    rectA.bottom > rectB.top
  );
}

// Shield activation
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !shieldActive && !shieldCooldown) {
    shieldActive = true;
    shield.style.display = "block";
    shieldCooldown = true;

    setTimeout(() => {
      shieldActive = false;
      shield.style.display = "none";
      setTimeout(() => (shieldCooldown = false), 3000); // Cooldown
    }, 2000);
  }
});

// Add collectible
function setupCollectible() {
  const collectible = document.getElementById("collectible");

  function checkCollectibleCollision() {
    if (checkCollision(player, collectible)) {
      shield.style.width = "100px";
      shield.style.height = "100px";

      setTimeout(() => {
        shield.style.width = "70px";
        shield.style.height = "70px";
      }, 5000);

      collectible.style.display = "none";
      setTimeout(() => {
        collectible.style.left = `${Math.random() * (window.innerWidth - 50)}px`;
        collectible.style.bottom = `${Math.random() * (window.innerHeight - 150)}px`;
        collectible.style.display = "block";
      }, 5000);
    }
  }
  setInterval(checkCollectibleCollision, 100);
}
setupCollectible();

// Add Power Orb collectible
function setupPowerOrb() {
  const orb = document.createElement("div");
  orb.className = "power-orb";
  document.body.appendChild(orb);

  function placeOrb() {
    orb.style.left = `${Math.random() * (window.innerWidth - 50)}px`;
    orb.style.bottom = `${Math.random() * (window.innerHeight - 150)}px`;
  }

  function checkOrbCollision() {
    if (checkCollision(player, orb)) {
      powerUpSound.play();
      orbEffect.style.left = `${player.style.left}`;
      orbEffect.style.bottom = `${player.style.bottom}`;
      orbEffect.style.display = "block";
      setTimeout(() => {
        orbEffect.style.display = "none";
      }, 500);

      let speedBoost = 40;
      document.addEventListener("keydown", speedHandler);

      function speedHandler(e) {
        const left = parseInt(player.style.left || "50px");
        const bottom = parseInt(player.style.bottom || "100px");

        if (e.key === "ArrowRight" && left < window.innerWidth - 50) {
          player.style.left = `${left + speedBoost}px`;
        } else if (e.key === "ArrowLeft" && left > 0) {
          player.style.left = `${left - speedBoost}px`;
        } else if (e.key === "ArrowUp" && bottom < window.innerHeight - 50) {
          player.style.bottom = `${bottom + speedBoost}px`;
        } else if (e.key === "ArrowDown" && bottom > 0) {
          player.style.bottom = `${bottom - speedBoost}px`;
        }
      }

      setTimeout(() => {
        document.removeEventListener("keydown", speedHandler);
      }, 4000);

      orb.style.display = "none";
      setTimeout(() => {
        placeOrb();
        orb.style.display = "block";
      }, 10000);
    }
  }

  placeOrb();
  setInterval(checkOrbCollision, 100);
}
setupPowerOrb();

// Animate clouds
function animateClouds() {
  document.querySelectorAll('.cloud').forEach(cloud => {
    let left = parseFloat(cloud.style.left || '-200px');
    left += 0.2;
    if (left > window.innerWidth + 100) left = -300;
    cloud.style.left = `${left}px`;
  });
  requestAnimationFrame(animateClouds);
}
animateClouds();

// Position and animate sun and moon
function updateCelestialCycle() {
  const sun = document.querySelector('.sun');
  const moon = document.querySelector('.moon');
  if (sun) {
    sun.style.left = `${50 + 300 * Math.cos(Date.now() / 30000)}px`;
    sun.style.top = `${150 + 100 * Math.sin(Date.now() / 30000)}px`;
  }
  if (moon) {
    moon.style.left = `${50 + 300 * Math.cos((Date.now() + 30000) / 30000)}px`;
    moon.style.top = `${150 + 100 * Math.sin((Date.now() + 30000) / 30000)}px`;
  }
  requestAnimationFrame(updateCelestialCycle);
}
updateCelestialCycle();
// RAIN EFFECT
function createRainDrop() {
  const drop = document.createElement("div");
  drop.className = "raindrop";
  drop.style.left = `${Math.random() * window.innerWidth}px`;
  drop.style.top = `-20px`;
  document.body.appendChild(drop);

  let speed = 5 + Math.random() * 5;
  function fall() {
    const top = parseFloat(drop.style.top);
    if (top > window.innerHeight) {
      drop.remove();
      return;
    }
    drop.style.top = `${top + speed}px`;
    requestAnimationFrame(fall);
  }
  fall();
}

// Trigger rain periodically
setInterval(() => {
  for (let i = 0; i < 10; i++) {
    createRainDrop();
  }
}, 300);

// LIGHTNING EFFECT
function lightningStrike() {
  const flash = document.createElement("div");
  flash.className = "lightning-flash";
  document.body.appendChild(flash);

  setTimeout(() => {
    flash.remove();
  }, 100);
}

// Random lightning every ~10–20 seconds
setInterval(() => {
  if (Math.random() < 0.3) lightningStrike();
}, 10000);

// Rain & lightning CSS
const weatherStyle = document.createElement("style");
weatherStyle.textContent = `
.raindrop {
  position: fixed;
  width: 2px;
  height: 15px;
  background: linear-gradient(to bottom, #aaf, #36d 60%, #fff0 100%);
  opacity: 0.7;
  pointer-events: none;
  z-index: 9999;
  border-radius: 1px;
}
.lightning-flash {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255,255,255,0.85);
  opacity: 0.85;
  z-index: 99999;
  pointer-events: none;
  animation: lightning-flash 0.12s linear;
}
@keyframes lightning-flash {
  0% { opacity: 0.1; }
  40% { opacity: 0.85; }
  100% { opacity: 0; }
}
`;
document.head.appendChild(weatherStyle);