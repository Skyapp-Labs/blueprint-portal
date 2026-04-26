import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Layer hierarchy (low → high, each layer may only import from layers BELOW it):
 *   shared → core → features → app
 *
 * Rules enforced here via no-restricted-imports:
 *   - shared/  must NOT import from core/, features/, or app/
 *   - core/    must NOT import from features/ or app/
 *   - features must NOT import from app/
 *   - features must NOT import from sibling features (cross-feature rule, one config per feature)
 */

const ALL_FEATURES = [
  'auth',
  'users',
  'roles',
  'settings',
  'feature-flags',
  'logs',
  'notifications',
  'replay',
];

/**
 * For each feature, generate a rule that blocks imports from all OTHER features.
 * A feature may freely import from core/ and shared/, but never from a sibling feature.
 */
function crossFeatureRule(featureName) {
  const others = ALL_FEATURES.filter((f) => f !== featureName);
  return {
    files: [`src/features/${featureName}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: others.flatMap((other) => [
            {
              group: [`@/features/${other}`],
              message: `Cross-feature import blocked. Move shared logic to shared/ or core/.`,
            },
            {
              group: [`@/features/${other}/**`],
              message: `Cross-feature import blocked. Move shared logic to shared/ or core/.`,
            },
          ]),
        },
      ],
    },
  };
}

const sharedBoundary = {
  files: ["src/shared/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          { group: ["@/core/*", "@/core/**"], message: "shared/ must not import from core/" },
          { group: ["@/features/*", "@/features/**"], message: "shared/ must not import from features/" },
          { group: ["@/app/*", "@/app/**"], message: "shared/ must not import from app/" },
        ],
      },
    ],
  },
};

const coreBoundary = {
  files: ["src/core/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          { group: ["@/features/*", "@/features/**"], message: "core/ must not import from features/" },
          { group: ["@/app/*", "@/app/**"], message: "core/ must not import from app/" },
        ],
      },
    ],
  },
};

const featuresBoundary = {
  files: ["src/features/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          { group: ["@/app/*", "@/app/**"], message: "features/ must not import from app/" },
        ],
      },
    ],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  sharedBoundary,
  coreBoundary,
  featuresBoundary,
  ...ALL_FEATURES.map(crossFeatureRule),
]);

export default eslintConfig;
