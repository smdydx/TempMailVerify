// Format date to relative time (e.g., "2 minutes ago")
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) {
    return 'Just now';
  } else if (diffInMins < 60) {
    return `${diffInMins} ${diffInMins === 1 ? 'min' : 'mins'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  } else {
    // Format as MM/DD/YYYY
    return date.toLocaleDateString();
  }
}

// Extract OTP from content using regex
export function extractOTP(content: string): string | null {
  // Look for 4-8 digit numbers that might be OTP codes
  const otpRegexPatterns = [
    /verification code[^\d]*(\d{4,8})/i,
    /security code[^\d]*(\d{4,8})/i,
    /code is[^\d]*(\d{4,8})/i,
    /one-time password[^\d]*(\d{4,8})/i,
    /OTP[^\d]*(\d{4,8})/i,
    /code[^\d]*(\d{4,8})/i,
    /(\d{4,8})[^\d]*(is your)/i,
    /\b(\d{6})\b/ // Fallback to any 6-digit number
  ];

  for (const pattern of otpRegexPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Format the last refreshed time
export function formatLastRefreshed(date: Date | null): string {
  if (!date) return 'Never refreshed';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 10) {
    return 'Just now';
  } else if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else {
    return date.toLocaleTimeString();
  }
}

// Generate a random temporary email with @gmail.com domain that looks like a real user
export function generateRandomEmail(): string {
  // Common first names for variety
  const firstNames = ['john', 'alex', 'sara', 'mike', 'lisa', 'david', 'emma', 'james', 'sophia', 'ryan'];
  
  // Common last names for variety
  const lastNames = ['smith', 'jones', 'brown', 'miller', 'wilson', 'taylor', 'clark', 'davis', 'white', 'moore'];
  
  // Random separators that Gmail users often use
  const separators = ['', '.', '_'];
  
  // Generate random name components
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const separator = separators[Math.floor(Math.random() * separators.length)];
  
  // Add some random numbers (common in real email addresses)
  const randomNum = Math.floor(10 + Math.random() * 990);
  
  // Build the email address
  return `${firstName}${separator}${lastName}${randomNum}@gmail.com`;
}
