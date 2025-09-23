import React, { Component, ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { attendanceStyles } from '../../styles/attendanceStyles';
import { COLORS } from '../../constants/colors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AttendanceErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AttendanceErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={attendanceStyles.errorContainer}>
          <MaterialIcons 
            name="error-outline" 
            size={48} 
            color={COLORS.status.error} 
            style={{ marginBottom: 16 }}
          />
          <Text style={[attendanceStyles.errorText, { fontSize: 16, fontWeight: '600' }]}>
            Something went wrong
          </Text>
          <Text style={[attendanceStyles.errorText, { fontSize: 14, marginTop: 8 }]}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Button 
            mode="contained" 
            onPress={this.handleRetry}
            style={{ marginTop: 16 }}
          >
            Try Again
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}