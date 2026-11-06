declare module "react-native" {
  export const View: any;
  export const Text: any;
  export const Image: any;
  export const ScrollView: any;
  export const TouchableOpacity: any;
  export const TextInput: any;
  export const ActivityIndicator: any;
  export const RefreshControl: any;
  export const Share: {
    share: (content: { message: string; title?: string; url?: string }) => Promise<any>;
  };
  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
    absoluteFillObject: any;
  };
  export const Platform: {
    OS: "ios" | "android" | "web" | "windows" | "macos";
    select: <T>(obj: Record<string, T>) => T;
  };
  export const Dimensions: {
    get: (dim: "window" | "screen") => { width: number; height: number };
  };
  export const Alert: {
    alert: (title: string, message?: string, buttons?: Array<{ text: string; onPress?: () => void; style?: string }>) => void;
  };
  export const KeyboardAvoidingView: any;
  export type ViewStyle = any;
  export type TextStyle = any;
  export type ImageStyle = any;
}

declare module "expo-router" {
  export const useRouter: () => {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
  };
  export const useLocalSearchParams: <T extends Record<string, string | string[]>>() => T;
  export const Stack: any;
  export const Tabs: any;
  export const Link: any;
}

declare module "expo-status-bar" {
  export const StatusBar: any;
}

declare module "react-native-safe-area-context" {
  export const SafeAreaProvider: any;
  export const SafeAreaView: any;
  export const useSafeAreaInsets: () => { top: number; bottom: number; left: number; right: number };
}

declare module "@tanstack/react-query" {
  export class QueryClient {
    constructor(options?: any);
  }
  export const QueryClientProvider: any;
  export const useQuery: <T>(options: {
    queryKey: any[];
    queryFn: () => Promise<T>;
    refetchInterval?: number | false;
    enabled?: boolean;
  }) => {
    data: T | undefined;
    isLoading: boolean;
    isRefetching?: boolean;
    error: any;
    refetch: () => void;
  };
  export const useMutation: <TData, TVariables>(options: {
    mutationFn: (variables: TVariables) => Promise<TData>;
    onSuccess?: (data: TData) => void;
    onError?: (error: any) => void;
  }) => {
    mutate: (variables: TVariables) => void;
    isPending: boolean;
  };
}

declare module "lucide-react-native" {
  export const Compass: any;
  export const Ticket: any;
  export const Heart: any;
  export const User: any;
  export const Calendar: any;
  export const MapPin: any;
  export const Clock: any;
  export const ShieldCheck: any;
  export const Users: any;
  export const ArrowRight: any;
  export const Check: any;
  export const Sparkles: any;
  export const Info: any;
  export const RefreshCw: any;
  export const QrCode: any;
  export const Search: any;
  export const Flame: any;
  export const Phone: any;
  export const Mail: any;
  export const CreditCard: any;
  export const LogOut: any;
  export const FileText: any;
  export const ChevronRight: any;
  export const Building2: any;
  export const Wallet: any;
  export const CheckCircle2: any;
  export const AlertTriangle: any;
  export const Share2: any;
}

declare module "react-native-qrcode-svg" {
  const QRCode: any;
  export default QRCode;
}
