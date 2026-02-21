import { useState, useEffect } from "react";
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
  Center, 
  Loader 
} from "@mantine/core";
import { IconAt, IconLock, IconMail, IconCheck, IconX } from "@tabler/icons-react";
import { vibeNotify } from "../utils/vibeNotify";

// 🔥 Strict Instagram-style Validation Schema
const schema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .min(4, "Must be at least 4 characters")
    .matches(/^\S*$/, "No spaces allowed") // Strict no spaces
    .matches(/\d/, "Must contain at least one number (0-9)")
    .matches(/^[a-zA-Z0-9._]+$/, "Only letters, numbers, dots, and underscores allowed"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required(),
}).required();

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [checking, setChecking] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange", // Validates as user types
  });

  const usernameValue = watch("username");

  // 🔥 Debounced Username Availability Check
  useEffect(() => {
    // Only check API if Yup validation passes
    if (!usernameValue || errors.username) {
      setUsernameStatus(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setChecking(true);
        const res = await api.get(`/auth/check-username?username=${usernameValue}`);
        setUsernameStatus(res.data.available ? "available" : "taken");
      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [usernameValue, errors.username]);

  const onSubmit = async (data) => {
    if (usernameStatus !== "available") return;
    vibeNotify.loading("Creating Account", "Just a moment while we set up your vibe...");
    try {
      const res = await api.post("/auth/register", data);
      vibeNotify.stopLoading("success", "Account Created!", "Welcome to Vibe!");
      navigate("/login");
    } catch (error) {
      vibeNotify.stopLoading("error", "Registration Failed", error.response?.data?.message || "Something went wrong");
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
              Sign up to see photos and videos from your friends.
            </Text>
          </Stack>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing="md">
              
              {/* Username Field */}
              <TextInput
                placeholder="Username"
                leftSection={<IconAt size={18} />}
                variant="filled"
                radius="md"
                size="md"
                {...register("username")}
                onChange={(e) => {
                  // Force lowercase and remove spaces like Instagram
                  const val = e.target.value.replace(/\s/g, "").toLowerCase();
                  setValue("username", val, { shouldValidate: true });
                }}
                error={errors.username?.message || (usernameStatus === "taken" ? "This username is already taken" : null)}
                rightSection={
                  checking ? <Loader size="xs" /> : 
                  (usernameStatus === "available" && !errors.username) ? <IconCheck size={18} color="green" /> : 
                  (usernameStatus === "taken" || errors.username) ? <IconX size={18} color="red" /> : null
                }
              />
              {usernameStatus === "available" && !errors.username && (
                <Text size="xs" color="green" mt={-12} pl="xs" weight={600}>
                  That username is available!
                </Text>
              )}

              {/* Email Field */}
              <TextInput
                placeholder="Email address"
                leftSection={<IconMail size={18} />}
                variant="filled"
                radius="md"
                size="md"
                {...register("email")}
                error={errors.email?.message}
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
                gradient={{ from: 'purple', to: 'indigo' }}
                disabled={!isValid || usernameStatus !== "available"}
                mt="sm"
              >
                Sign up
              </Button>
            </Stack>
          </form>

          <Center>
            <Text size="sm">
              Have an account?{' '}
              <Text 
                component="span" 
                color="indigo" 
                weight={700} 
                style={{ cursor: 'pointer' }} 
                onClick={() => navigate('/login')}
              >
                Log in
              </Text>
            </Text>
          </Center>

        </Stack>
      </Center>
    </Container>
  );
};

export default Register;