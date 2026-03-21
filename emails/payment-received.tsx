import { Html, Head, Body, Container, Heading, Text, Preview } from '@react-email/components'

interface Props {
  dealTitle: string
  creatorName: string
  amount?: string
}

export default function PaymentReceivedEmail({ dealTitle, creatorName, amount }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your payment has been sent for &quot;{dealTitle}&quot;</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ padding: '40px 20px', maxWidth: '560px', margin: '0 auto' }}>
          <Heading style={{ fontSize: '24px', color: '#111827' }}>Your payment has been sent</Heading>
          <Text style={{ color: '#6b7280' }}>Hi {creatorName},</Text>
          <Text style={{ color: '#6b7280' }}>
            Payment for your work on <strong>&quot;{dealTitle}&quot;</strong> has been initiated.
            {amount ? ` Amount: ${amount}.` : ''} Please allow a few business days for the funds to
            arrive.
          </Text>
          <Text style={{ color: '#6b7280' }}>
            If you have any questions about your payment, please contact your agency.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
