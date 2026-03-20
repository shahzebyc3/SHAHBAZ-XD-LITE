document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  // Elements
  const phoneInput = document.getElementById("phone");
  const requestPairingBtn = document.getElementById("requestPairing");
  const statusEl = document.getElementById("status");
  const welcomeModal = document.getElementById("welcomeModal");
  const modalClose = document.getElementById("modalClose");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.querySelector('.nav-links');
  const nav = document.getElementById('nav');

  // Initialize animations
  initAnimations();

  // Check if modal has been shown before using sessionStorage
  const modalShown = sessionStorage.getItem('welcomeModalShown');

  // Close modal functions
  function closeModal() {
    welcomeModal.classList.remove('active');
    setTimeout(() => {
      welcomeModal.style.display = 'none';
    }, 400);
  }
  
  modalClose.addEventListener('click', closeModal);

  // Close modal when clicking on fork and star buttons
  document.querySelectorAll('.github-buttons a').forEach(button => {
    button.addEventListener('click', closeModal);
  });

  // Close modal when clicking outside
  welcomeModal.addEventListener('click', (e) => {
    if (e.target === welcomeModal) {
      closeModal();
    }
  });

  // Show modal only when requesting pairing code (if not shown before)
  requestPairingBtn.addEventListener("click", async () => {
    // Show modal only if it hasn't been shown before in this session
    if (!modalShown) {
      welcomeModal.style.display = 'flex';
      setTimeout(() => {
        welcomeModal.classList.add('active');
      }, 50);
      
      // Mark as shown in sessionStorage
      sessionStorage.setItem('welcomeModalShown', 'true');
    }

    // Rest of your existing pairing code logic...
    const number = phoneInput.value.trim();
    if (!number) {
      showStatus("❌ Please enter your phone number (with country code).", "error");
      return;
    }

    // Validate phone number format
    if (!/^[0-9]{8,15}$/.test(number.replace(/\D/g, ''))) {
      showStatus("❌ Please enter a valid phone number (digits only, 8-15 characters).", "error");
      return;
    }

    showStatus("<span class='spinner'></span> Requesting pairing code...", "loading");
    requestPairingBtn.disabled = true;
    requestPairingBtn.classList.add("loading");

    try {
      const res = await fetch("/api/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        showStatus("❌ Error: " + (data.error || "Failed to request pairing"), "error");
        requestPairingBtn.disabled = false;
        requestPairingBtn.classList.remove("loading");
        return;
      }

      const code = (data.pairingCode || "").toString().trim();
      const spacedCode = code.split("").join(" ");
      
      showStatus(`
        <div style="text-align: center;">
          <p style="margin-bottom: 20px; font-size: 1.1rem;">✅ Pairing code for <strong>${number}</strong>:</p>
          <div class="pairing-code" id="pairingCode">${spacedCode}</div>
          <p style="margin-top: 16px; opacity: 0.8;"><small>Click the code to copy — then enter it in WhatsApp to complete pairing.</small></p>
        </div>
      `, "success");

      // Add copy functionality with enhanced animation
      const pairingEl = document.getElementById("pairingCode");
      if (pairingEl) {
        pairingEl.addEventListener("click", () => {
          navigator.clipboard.writeText(code)
            .then(() => {
              const originalText = pairingEl.textContent;
              pairingEl.textContent = "Copied!";
              pairingEl.style.letterSpacing = "2px";
              pairingEl.style.background = "rgba(0, 255, 102, 0.3)";
              pairingEl.style.boxShadow = "0 0 30px rgba(0, 255, 102, 0.5)";
              
              setTimeout(() => {
                pairingEl.textContent = originalText;
                pairingEl.style.letterSpacing = "10px";
                pairingEl.style.background = "rgba(0, 0, 0, 0.4)";
                pairingEl.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.2)";
              }, 2000);
            })
            .catch(() => {
              showStatus("❌ Failed to copy to clipboard. Please manually copy the code.", "error");
            });
        });
      }
    } catch (err) {
      console.error("Pairing request failed", err);
      showStatus("❌ Failed to request pairing code (network or server error).", "error");
    } finally {
      requestPairingBtn.disabled = false;
      requestPairingBtn.classList.remove("loading");
    }
  });

  // Mobile navigation toggle
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.innerHTML = navLinks.classList.contains('active') ?
      '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });

  // Close mobile menu when clicking on links
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      navToggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });

  // ✅ Listen for stats updates from server
  socket.on("statsUpdate", ({ activeSockets, totalUsers }) => {
    animateCounter("activeSockets", activeSockets);
    animateCounter("totalUsers", totalUsers);
  });

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
  });

  // Show status message with enhanced animation
  function showStatus(message, type = "") {
    statusEl.innerHTML = message;
    statusEl.className = "";
    if (type) statusEl.classList.add(type);
    
    // Reset animation
    statusEl.classList.remove("visible");
    void statusEl.offsetWidth; // Trigger reflow
    statusEl.classList.add("visible");
  }

  // Socket: Linked event
  socket.on("linked", ({ sessionId }) => {
    showStatus(`
      <div style="text-align: center; color: var(--success);">
        <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 20px; animation: bounce 2s infinite;"></i>
        <h3 style="margin-bottom: 16px;">✅ Successfully Linked!</h3>
        <p>Your device has been successfully connected. You can now use SHAHBAZ-XD-LITE features.</p>
        <p style="margin-top: 12px; opacity: 0.8;"><small>Session ID: ${sessionId}</small></p>
      </div>
    `, "success");
    
    // Reset the form after successful pairing
    phoneInput.value = "";
    
    // Add confetti effect
    createConfetti();
  });

  // Socket: pairing timeout
  socket.on("pairingTimeout", ({ number }) => {
    showStatus(`
      <div style="text-align: center; color: var(--warning);">
        <i class="fas fa-clock" style="font-size: 2.5rem; margin-bottom: 16px;"></i>
        <h3 style="margin-bottom: 12px;">⏰ Pairing Code Expired</h3>
        <p>Pairing code for ${number} has expired.</p>
        <p>Please request a new code if you still need to connect.</p>
      </div>
    `, "warning");
  });

  // Handle Enter key in phone input
  phoneInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      requestPairingBtn.click();
    }
  });

  // Input validation for phone number
  phoneInput.addEventListener("input", function(e) {
    this.value = this.value.replace(/\D/g, '');
  });

  // Set current year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Create particle effect
  function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = window.innerWidth < 768 ? 25 : 50;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random properties
      const size = Math.random() * 4 + 1;
      const posX = Math.random() * 100;
      const delay = Math.random() * 20;
      const duration = Math.random() * 15 + 20;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.animationDelay = `${delay}s`;
      particle.style.animationDuration = `${duration}s`;
      
      particlesContainer.appendChild(particle);
    }
  }
  
  createParticles();

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Initialize animations
  function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe cards for scroll animations
    document.querySelectorAll('.card, .feature-item, .stat-card').forEach(element => {
      observer.observe(element);
    });

    // Add initial animation to header
    const header = document.querySelector('header');
    header.style.opacity = '0';
    header.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      header.style.transition = 'opacity 1s ease, transform 1s ease';
      header.style.opacity = '1';
      header.style.transform = 'translateY(0)';
    }, 300);
  }

  // Animate counter values
  function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    const duration = 1000; // 1 second
    const step = (targetValue - currentValue) / (duration / 16); // 60fps
    
    let current = currentValue;
    const timer = setInterval(() => {
      current += step;
      if ((step > 0 && current >= targetValue) || (step < 0 && current <= targetValue)) {
        current = targetValue;
        clearInterval(timer);
      }
      element.textContent = Math.round(current);
    }, 16);
  }

  // Create confetti effect for successful pairing
  function createConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '9999';
    document.body.appendChild(confettiContainer);

    const colors = ['#00ff88', '#00cc66', '#66ff33', '#33cc33', '#9eff9e'];
    const confettiCount = 100;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = Math.random() * 10 + 5 + 'px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-10px';
      confetti.style.opacity = Math.random() * 0.5 + 0.5;
      confettiContainer.appendChild(confetti);

      // Animate confetti
      const animation = confetti.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: `translateY(100vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
      ], {
        duration : Math.random() * 3000 + 2000,
        easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
      });

      animation.onfinish = () => {
        confetti.remove();
        if (confettiContainer.children.length === 0) {
          confettiContainer.remove();
        }
      };
    }
  }

  // Add hover effect to buttons
  document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-3px) scale(1.02)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Add ripple effect to buttons
  document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Add CSS for ripple effect
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    .btn {
      position: relative;
      overflow: hidden;
    }
    
    .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple-animation 0.6s linear;
    }
    
    @keyframes ripple-animation {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(rippleStyle);
});
