const player = document.getElementById("player");
const shield = document.getElementById("shield");
const obstacles = Array.from(document.querySelectorAll(".obstacle"));
let shieldActive = false;
let shieldCooldown = false;

// Initialize obstacle data
const obstacleData = [
  { speedX: 2, speedY: 2, dirX: 1, dirY: 1 },
  { speedX: 3, speedY: 1, dirX: -1, dirY: 1 },
  { speedX: 1, speedY: 3, dirX: 1, dirY: -1 },
];

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