# Navigation Configuration

This configuration system allows you to enable/disable navigation features dynamically without modifying the code.

## Configuration File

The main configuration is located in `src/config/navigation.js`.

## How to Use

### Enable/Disable Features

Edit the `navigationConfig` object in `src/config/navigation.js`:

```javascript
export const navigationConfig = {
  // Core features (always enabled)
  dashboard: true,
  aiRca: true,
  
  // Optional features (can be enabled/disabled)
  patternDetector: false,        // Pattern & Duplicate Detector
  playbookRecommender: false,    // Playbook Recommender
  customerRcaSummary: false,     // Customer RCA Summary
  alertCorrelation: false,       // Alert Correlation
  complianceAudit: false,        // Compliance & Audit
}
```

### Available Features

| Feature | Description | Default |
|---------|-------------|---------|
| `dashboard` | Main Dashboard | `true` |
| `aiRca` | AI RCA Guidance | `true` |
| `patternDetector` | Pattern & Duplicate Detector | `false` |
| `playbookRecommender` | Playbook Recommender | `false` |
| `customerRcaSummary` | Customer RCA Summary | `false` |
| `alertCorrelation` | Alert Correlation | `false` |
| `complianceAudit` | Compliance & Audit | `false` |

### Enabling Features

To enable a feature, set its value to `true`:

```javascript
export const navigationConfig = {
  // ... other config
  patternDetector: true,  // Enable Pattern & Duplicate Detector
  playbookRecommender: true,  // Enable Playbook Recommender
  // ... other config
}
```

### Disabling Features

To disable a feature, set its value to `false`:

```javascript
export const navigationConfig = {
  // ... other config
  patternDetector: false,  // Disable Pattern & Duplicate Detector
  // ... other config
}
```

## How It Works

1. **Sidebar Navigation**: The sidebar automatically shows/hides navigation items based on the configuration
2. **Routes**: Routes are conditionally included based on the configuration
3. **Dynamic Loading**: Only enabled features are loaded and accessible

## Benefits

- **Clean Interface**: Only show features that are needed
- **Easy Management**: Enable/disable features without code changes
- **Performance**: Disabled features don't load unnecessary components
- **Flexibility**: Different environments can have different feature sets

## Example Scenarios

### Development Environment
```javascript
export const navigationConfig = {
  dashboard: true,
  aiRca: true,
  patternDetector: true,        // Enable for testing
  playbookRecommender: true,    // Enable for testing
  customerRcaSummary: true,     // Enable for testing
  alertCorrelation: true,       // Enable for testing
  complianceAudit: true,        // Enable for testing
}
```

### Production Environment
```javascript
export const navigationConfig = {
  dashboard: true,
  aiRca: true,
  patternDetector: false,       // Disable in production
  playbookRecommender: false,   // Disable in production
  customerRcaSummary: false,    // Disable in production
  alertCorrelation: false,      // Disable in production
  complianceAudit: false,       // Disable in production
}
```

### Minimal Setup
```javascript
export const navigationConfig = {
  dashboard: true,
  aiRca: true,
  patternDetector: false,
  playbookRecommender: false,
  customerRcaSummary: false,
  alertCorrelation: false,
  complianceAudit: false,
}
```

## Adding New Features

To add a new feature:

1. Add the feature to `navigationConfig`
2. Add the feature details to `navigationItems`
3. Import the necessary icon in `Sidebar.jsx`
4. Add the icon to the `iconMap`
5. Add the route conditionally in `routes/index.jsx`
