import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  errorText: {
    color: '#ef4444',
    marginBottom: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 20,
  },
  helperTextError: {
    color: '#ef4444',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  link: {
    color: '#7c3aed',
    fontWeight: '600',
    fontSize: 14,
  },
  linkButton: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 8,
  },
  linkSmall: {
    color: '#7c3aed',
    fontWeight: '600',
    fontSize: 13,
  },
  termsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  termsText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    marginTop: -8,
    marginBottom: 16,
    marginHorizontal: 20,
    gap: 4,
  },
  passwordStrengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  passwordStrengthBarFilled: {
    backgroundColor: '#3b82f6',
  },
  passwordStrengthBarWeak: {
    backgroundColor: '#ef4444',
  },
  passwordStrengthBarMedium: {
    backgroundColor: '#f59e0b',
  },
  passwordStrengthBarStrong: {
    backgroundColor: '#10b981',
  },
  passwordStrengthText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    marginLeft: 20,
    marginBottom: 12,
  },
});

