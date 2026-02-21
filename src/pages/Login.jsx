import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import api from "../services/axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Text, 
  Stack, 
  Container, 
  Center 
} from "@mantine/core";
import { IconUser, IconLock } from "@tabler/icons-react";
import { vibeNotify } from "../utils/vibeNotify";
import { requestNotificationPermission } from "../firebase/notification";

// 🔥 Validation Schema
const schema = yup.object({
  identifier: yup.string().required("Username or email is required"),
  password: yup.string().required("Password is required"),
}).required();

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onLogin = async (data) => {
    // Loading starts with a specific vibe title
    vibeNotify.loading("Logging In", "Setting up your session...");

    try {
        const res = await api.post("/auth/login", data);
        
        

        if(res){
          // On Success: Change title to something welcoming
          vibeNotify.stopLoading(
          'success', 
          'Welcome to the Vibe!', 
          `Logged in as @${res.data.username}`
          );
          
          dispatch(setCredentials({ user: res.data, token: res.data.token }));
          navigate("/");

          const token = await requestNotificationPermission();
  
          if (token) {
            await api.post("/users/save-fcm-token", { token });
          }
        }
    } catch (error) {
        // On Error: Change title to something specific
        const errMsg = error.response?.data?.message || "Something went wrong";
        vibeNotify.stopLoading('error', 'Login Failed', errMsg);
    }
    };

  return (
    <Container size="xs" h="100vh">
      <Center h="100%">
        <Stack w="100%" spacing="xl">
          
          {/* Vibe Branding */}
          <Stack align="center" spacing={0}>
            <Text 
              size="42px" 
              weight={900} 
              variant="gradient" 
              gradient={{ from: 'indigo', to: 'cyan' }}
              style={{ letterSpacing: '-1px' }}
            >
              Vibe
            </Text>
            <Text color="dimmed" size="sm" weight={500}>
              Welcome back! Ready to catch the vibe?
            </Text>
          </Stack>

          <form onSubmit={handleSubmit(onLogin)}>
            <Stack spacing="md">
              
              {/* Identifier Field (Email or Username) */}
              <TextInput
                placeholder="Username or email"
                leftSection={<IconUser size={18} />}
                variant="filled"
                radius="md"
                size="md"
                {...register("identifier")}
                error={errors.identifier?.message}
              />

              {/* Password Field */}
              <PasswordInput
                placeholder="Password"
                leftSection={<IconLock size={18} />}
                variant="filled"
                radius="md"
                size="md"
                {...register("password")}
                error={errors.password?.message}
              />

              <Button 
                type="submit" 
                size="md" 
                radius="md" 
                fullWidth 
                variant="gradient"
                gradient={{ from: 'purple', to: 'cyan' }}
                loading={isSubmitting}
                mt="sm"
              >
                Log In
              </Button>
            </Stack>
          </form>

          {/* Switch to Register */}
          <Center>
            <Text size="sm">
              Don't have an account?{' '}
              <Text 
                component="span" 
                color="indigo" 
                weight={700} 
                style={{ cursor: 'pointer' }} 
                onClick={() => navigate('/register')}
              >
                Sign up
              </Text>
            </Text>
          </Center>

        </Stack>
      </Center>
    </Container>
  );
};

export default Login;